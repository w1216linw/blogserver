"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
require("dotenv-safe/config");
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const type_graphql_1 = require("type-graphql");
const post_1 = require("./resolvers/post");
const user_1 = require("./resolvers/user");
const ioredis_1 = __importDefault(require("ioredis"));
const express_session_1 = __importDefault(require("express-session"));
const connect_redis_1 = __importDefault(require("connect-redis"));
const constants_1 = require("./constants");
const apollo_server_core_1 = require("apollo-server-core");
const cors_1 = __importDefault(require("cors"));
const createUserLoader_1 = require("./utils/createUserLoader");
const createUpdootLoader_1 = require("./utils/createUpdootLoader");
const ormconfig_1 = require("./ormconfig");
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield ormconfig_1.AppDataSource.initialize();
        yield ormconfig_1.AppDataSource.runMigrations();
    }
    catch (err) {
        console.error("error during data source init: ", err);
    }
    const app = (0, express_1.default)();
    const RedisStore = (0, connect_redis_1.default)(express_session_1.default);
    const redis = new ioredis_1.default(process.env.REDIS_URL);
    app.set("trust proxy", 1);
    app.use((0, cors_1.default)({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    }));
    app.use((0, express_session_1.default)({
        name: constants_1.COOKIE_NAME,
        store: new RedisStore({
            client: redis,
            disableTouch: true,
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
            httpOnly: true,
            secure: constants_1.__prod__,
            sameSite: "lax"
        },
        saveUninitialized: false,
        secret: process.env.SESSION_SECRET,
        resave: false,
    }));
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema: yield (0, type_graphql_1.buildSchema)({
            resolvers: [post_1.PostResolver, user_1.UserResolver],
            validate: false,
        }),
        plugins: [(0, apollo_server_core_1.ApolloServerPluginLandingPageGraphQLPlayground)()],
        context: ({ req, res }) => ({ req, res, redis, AppDataSource: ormconfig_1.AppDataSource, userLoader: (0, createUserLoader_1.createUserLoader)(), updootLoader: (0, createUpdootLoader_1.createUpdootLoader)() }),
    });
    yield apolloServer.start();
    apolloServer.applyMiddleware({
        app,
        cors: false,
    });
    app.listen(parseInt(process.env.PORT), () => {
        console.log(`server started on localhost: ${process.env.PORT}`);
    });
});
main().catch((err) => console.log(err));
//# sourceMappingURL=index.js.map