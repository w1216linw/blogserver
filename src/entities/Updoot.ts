import {
  Entity,
  BaseEntity,
  ManyToOne,
  PrimaryColumn,
  Column,
} from "typeorm";

import { ObjectType, Field } from "type-graphql";
import { BUser } from "./User";
import{ Post} from "./Post";

@ObjectType()
@Entity()
export class Updoot extends BaseEntity {
  @Field()
  @Column({type: 'int'})
  value: number

  @Field()
  @PrimaryColumn()
  userId: number;

  @Field(() => BUser)
  @ManyToOne(() => BUser, (user) => user.updoots)
  user: BUser;

  @Field()
  @PrimaryColumn()
  postId: number;

  @Field(() => Post)
  @ManyToOne(() => Post, (post) => post.updoots)
  post: Post;
}
