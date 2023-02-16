import { Request, Response } from 'express'
import { Session } from 'express-session';
import {Redis} from "ioredis";
import { DataSource } from "typeorm/data-source";
import { createUpdootLoader } from './utils/createUpdootLoader';
import { createUserLoader } from './utils/createUserLoader';
export type MyContext = {
  req: Request & {session?: Session & { userId?: number}};
  res: Response;
  redis: Redis;
  AppDataSource: DataSource;
  userLoader: ReturnType<typeof createUserLoader>;
  updootLoader: ReturnType<typeof createUpdootLoader>;
}