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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Initial1676518261812 = void 0;
class Initial1676518261812 {
    constructor() {
        this.name = 'Initial1676518261812';
    }
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`CREATE TABLE "updoot" ("value" integer NOT NULL, "userId" integer NOT NULL, "postId" integer NOT NULL, CONSTRAINT "PK_6476d7e464bcb8571004134515c" PRIMARY KEY ("userId", "postId"))`);
            yield queryRunner.query(`CREATE TABLE "post" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "text" character varying NOT NULL, "points" integer NOT NULL DEFAULT '0', "creatorId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee" PRIMARY KEY ("id"))`);
            yield queryRunner.query(`CREATE TABLE "b_user" ("id" SERIAL NOT NULL, "username" character varying NOT NULL, "email" character varying NOT NULL, "password" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_1ec5128b49c96b324d34349473e" UNIQUE ("username"), CONSTRAINT "UQ_defc63ce20e028528ae9c87839f" UNIQUE ("email"), CONSTRAINT "PK_17c14b3a369d8c754ae95180936" PRIMARY KEY ("id"))`);
            yield queryRunner.query(`ALTER TABLE "updoot" ADD CONSTRAINT "FK_9df9e319a273ad45ce509cf2f68" FOREIGN KEY ("userId") REFERENCES "b_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
            yield queryRunner.query(`ALTER TABLE "updoot" ADD CONSTRAINT "FK_fd6b77bfdf9eae6691170bc9cb5" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
            yield queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "FK_9e91e6a24261b66f53971d3f96b" FOREIGN KEY ("creatorId") REFERENCES "b_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        });
    }
    down(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "FK_9e91e6a24261b66f53971d3f96b"`);
            yield queryRunner.query(`ALTER TABLE "updoot" DROP CONSTRAINT "FK_fd6b77bfdf9eae6691170bc9cb5"`);
            yield queryRunner.query(`ALTER TABLE "updoot" DROP CONSTRAINT "FK_9df9e319a273ad45ce509cf2f68"`);
            yield queryRunner.query(`DROP TABLE "b_user"`);
            yield queryRunner.query(`DROP TABLE "post"`);
            yield queryRunner.query(`DROP TABLE "updoot"`);
        });
    }
}
exports.Initial1676518261812 = Initial1676518261812;
//# sourceMappingURL=1676518261812-Initial.js.map