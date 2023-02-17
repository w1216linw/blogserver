import { Post } from "../../entities/Post";
import { ObjectType, Field } from "type-graphql";

@ObjectType()
export class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];

  @Field()
  hasMore: boolean;
}