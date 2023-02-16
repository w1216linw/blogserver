import "reflect-metadata";
import "dotenv-safe/config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import { COOKIE_NAME, __prod__ } from "./constants";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import cors from "cors";
import { createUserLoader } from "./utils/createUserLoader";
import { createUpdootLoader } from "./utils/createUpdootLoader";
import {AppDataSource} from './ormconfig';

const main = async () => {

  try {
    await AppDataSource.initialize();
    await AppDataSource.runMigrations();
  } catch (err) {
    console.error("error during data source init: ", err);
  }

  const app = express();

  const RedisStore = connectRedis(session);
  const redis = new Redis(process.env.REDIS_URL);

  app.set("trust proxy", 1);

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    })
  );

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis as any,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        httpOnly: true,
        secure: __prod__, //true - cookie only works in https
        sameSite: "lax" //csrf,
      },
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET,
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [ PostResolver, UserResolver],
      validate: false,
    }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
    context: ({ req, res }) => ({ req, res, redis, AppDataSource, userLoader: createUserLoader(), updootLoader : createUpdootLoader() }),
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.listen(parseInt(process.env.PORT), () => {
    console.log(`server started on localhost: ${process.env.PORT}`);
  });
};

main().catch((err) => console.log(err));
