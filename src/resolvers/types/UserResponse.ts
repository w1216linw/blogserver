import { BUser } from "../../entities/User";
import { ObjectType, Field } from "type-graphql";
import { FieldError } from "./FieldError";

@ObjectType()
export class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => BUser, { nullable: true })
  user?: BUser;
}