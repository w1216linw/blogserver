import { ObjectType, Field } from 'type-graphql';
import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, BaseEntity, OneToMany} from "typeorm";
import { Post } from './Post';
import { Updoot } from './Updoot';


@ObjectType()
@Entity()
export class BUser extends BaseEntity{
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({unique: true})
  username!: string;
  
  @Field()
  @Column({unique: true})
  email!: string;
  
  @OneToMany(() => Post, post => post.creator)
  posts: Post[];
  
  @Column({ type: 'text'})
  password!: string;
  
  @OneToMany(() => Updoot, updoot => updoot.user)
  updoots: Updoot[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;
  
  @Field(() => String)
  @UpdateDateColumn({})
  updatedAt: Date;
}