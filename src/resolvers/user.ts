import { BUser } from "../entities/User";
import { MyContext } from "../types";
import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Field,
  Ctx,
  ObjectType,
  FieldResolver,
  Root,
} from "type-graphql";
import argon2 from "argon2";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { LoginInput } from "./LoginInput";
import { validateRegister } from "../utils/validateRegister";
import { v4 } from "uuid";
import { sendEmail } from "../utils/sendEmail";

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => BUser, { nullable: true })
  user?: BUser;
}

@Resolver(BUser)
export class UserResolver {
  @FieldResolver(() => String)
  email(@Root() user: BUser, @Ctx() { req }: MyContext) {
    if(req.session.userId === user.id) {
      return user.email;
    }

    return "";
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { req, redis }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length <= 2) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "password must be longer than 3 characters",
          },
        ],
      };
    }
    const key = FORGET_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);

    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "token expired",
          },
        ],
      };
    }

    const userIdNum = parseInt(userId);
    const user = await BUser.findOne({ where: { id: userIdNum } });

    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "user not exists",
          },
        ],
      };
    }

    await BUser.update(
      { id: userIdNum },
      { password: await argon2.hash(newPassword) }
    );

    await redis.del(key);
    //logging user
    req.session.userId = user.id;
    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis }: MyContext
  ) {
    const user = await BUser.findOne({ where: { email } });
    if (!user) {
      return true;
    }
    const token = v4();
    await redis.setex(
      FORGET_PASSWORD_PREFIX + token,
      1000 * 60 * 60 * 24 * 3,
      user.id
    );
    await sendEmail(
      email,
      `
      <a href="http://localhost:3000/change-password/${token}" >rest password</a>
      `
    );
    return true;
  }

  @Query(() => BUser, { nullable: true })
  me(@Ctx() { req }: MyContext) {
    if (!req.session.userId) {
      return null;
    }

    return BUser.findOne({ where: { id: req.session.userId } });
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { req, AppDataSource }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);
    if (errors) {
      return { errors };
    }

    const hashedPassword = await argon2.hash(options.password);
    let user;
    try {
      /* User.create({}).save() equivalent to below*/
      const result = await AppDataSource.createQueryBuilder()
        .insert()
        .into(BUser)
        .values({
          username: options.username,
          email: options.email,
          password: hashedPassword,
        })
        .returning("*")
        .execute();

      user = result.raw[0];
    } catch (err) {
      if (err.code === "23505") {
        return {
          errors: [
            {
              field: "username",
              message: "username already taken",
            },
          ],
        };
      }
    }

    req.session.userId = user.id;

    return {
      user
    };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("options") options: LoginInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await BUser.findOne({
      where: options.usernameOrEmail.includes("@")
        ? { email: options.usernameOrEmail }
        : { username: options.usernameOrEmail },
    });
    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "username doesn't exist",
          },
        ],
      };
    }
    const valid = await argon2.verify(user.password, options.password);
    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "incorrect password",
          },
        ],
      };
    }

    req.session.userId = user.id;

    return {
      user,
    };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          resolve(false);
          return;
        }
        resolve(true);
      })
    );
  }
}
