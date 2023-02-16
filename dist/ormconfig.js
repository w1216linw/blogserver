"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("dotenv-safe/config");
const typeorm_1 = require("typeorm");
const User_1 = require("./entities/User");
const Post_1 = require("./entities/Post");
const Updoot_1 = require("./entities/Updoot");
const _1676518261812_Initial_1 = require("./migration/1676518261812-Initial");
const config = {
    type: "postgres",
    url: process.env.DATABASE_URL,
    entities: [User_1.BUser, Post_1.Post, Updoot_1.Updoot],
    migrations: [_1676518261812_Initial_1.Initial1676518261812],
    synchronize: false,
    logging: true
};
exports.AppDataSource = new typeorm_1.DataSource(config);
//# sourceMappingURL=ormconfig.js.map