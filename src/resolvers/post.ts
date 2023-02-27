import { Post } from "../entities/Post";
import {
  Resolver,
  Query,
  Ctx,
  Arg,
  Mutation,
  UseMiddleware,
  Int,
  FieldResolver,
  Root
} from "type-graphql";
import { MyContext } from "../types";
import { isAuth } from "../middleware/isAuth";
import { Updoot } from "../entities/Updoot";
import { BUser } from "../entities/User";
import { validatePost } from "../utils/validatePost";
import { PaginatedPosts, PostInput, PostResponse } from "./types";

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 100);
  }

  @FieldResolver(() => BUser)
  creator(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
    return userLoader.load(post.creatorId);
  }

  @FieldResolver(() => Int, { nullable: true })
  async voteState(
    @Root() post: Post,
    @Ctx() { updootLoader, req }: MyContext
  ) {
    if (!req.session.userId) {
      return null;
    }

    const updoot = await updootLoader.load({
      postId: post.id,
      userId: req.session.userId,
    });

    return updoot ? updoot.value : null;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req, AppDataSource }: MyContext
  ) {
    const { userId } = req.session;
    const isUpdoot = value !== -1;
    const realValue = isUpdoot ? 1 : -1;
    const updoot = await Updoot.findOne({ where: { postId, userId } });

    if (updoot && updoot.value !== realValue) {
      await AppDataSource.transaction(async (tm) => {
        await tm.query(
          `
          update updoot
          set value = $1
          where "postId" = $2 and "userId" = $3
          `,
          [realValue, postId, userId]
        );
        await tm.query(
          `
          update post
          set points = points + $1
          where id = $2;
          `,
          [2 * realValue, postId]
        );
      });
    } else if (!updoot) {
      await Updoot.insert({
        userId,
        postId,
        value: realValue,
      });

      await AppDataSource.query(
        `
      update post
      set points = points + $1
      where id = $2;
      `,
        [realValue, postId]
      );
    }

    return true;
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
    @Ctx() {AppDataSource }: MyContext
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(25, limit);
    const realLimitPlusOne = realLimit + 1;

    const replacements: any[] = [realLimitPlusOne];

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }

    const posts = await AppDataSource.query(
      `
    select p.*
    from post p
    ${cursor ? `where p."createdAt" < $2` : ""}
    order by p."createdAt" DESC
    limit $1
    `,
      replacements
    );
    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
  }

  @Query(() => PaginatedPosts)
  @UseMiddleware(isAuth)
  async myPosts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
    @Ctx() {req, AppDataSource}: MyContext 
  ): Promise<PaginatedPosts> {
    
    const realLimit = Math.min(25, limit);
    const realLimitPlusOne = realLimit + 1;

    const replacements: any[] = [realLimitPlusOne];

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }

    const posts = await AppDataSource.query(
      `
    select p.*
    from post p
    where p."creatorId" = ${req.session.userId}
    ${cursor ? `and p."createdAt" < $2` : ""}
    order by p."createdAt" DESC
    limit $1
    `,
      replacements
    );
    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("id", () => Int) id: number): Promise<Post | null> {
    return Post.findOne({ where: { id }, relations: ["creator"] });
  }

  @Mutation(() => PostResponse)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("input") input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<PostResponse> {

    const errors = validatePost(input)
    if (errors) {
      return {errors};
    }

    return {
     post: ( await Post.create({ ...input, creatorId: req.session.userId }).save())
    };
  }

  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg("id", () => Int) id: number,
    @Arg("title") title: string,
    @Arg("text") text: string,
    @Ctx() { req, AppDataSource }: MyContext
  ): Promise<Post | null> {
    const result = await AppDataSource.createQueryBuilder()
      .update(Post)
      .set({ title, text })
      .where('id = :id and "creatorId" = :creatorId', {
        id,
        creatorId: req.session.userId,
      })
      .returning("*")
      .execute();

    return result.raw[0];
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    const post = await Post.findOne({ where: { id } });
    if (!post) {
      return false;
    }
    if (post.creatorId !== req.session.userId) {
      throw new Error("not authorized");
    }

    await Updoot.delete({ postId: id });
    await Post.delete({ id, creatorId: req.session.userId });
    return true;
  }
}
