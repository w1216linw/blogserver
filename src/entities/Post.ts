import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, BaseEntity, ManyToOne, OneToMany } from "typeorm";

import { ObjectType, Field, Int} from 'type-graphql';
import { BUser } from "./User";
import { Updoot } from "./Updoot";


@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;
  
  @Field()
  @Column() 
  title!: string;

  @Field()
  @Column() 
  text!: string;

  @Field(() => Int, { nullable: true})
  voteState: number | null;

  @Field()
  @Column({type: 'int', default: 0}) 
  points!: number;

  @Field()
  @Column()
  creatorId: number;

  @Field(() => BUser) 
  @ManyToOne(() => BUser, user => user.posts)
  creator: BUser;

  @OneToMany(() => Updoot, updoot => updoot.post)
  updoots: Updoot[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;
  
  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;

}
