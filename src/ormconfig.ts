import "dotenv-safe/config";
import { DataSourceOptions } from "typeorm";
import { DataSource } from 'typeorm';
import { BUser } from "./entities/User";
import { Post } from "./entities/Post";
import { Updoot } from "./entities/Updoot";
import { Initial1676518261812 } from "./migration/1676518261812-Initial";

const config: DataSourceOptions = {
    type: "postgres",
    url: process.env.DATABASE_URL,
    entities: [BUser, Post, Updoot],
    migrations: [Initial1676518261812],
    synchronize: false,
    logging: true
}

export const AppDataSource = new DataSource(config);
