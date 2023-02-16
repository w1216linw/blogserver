import DataLoader from "dataloader";
import { Updoot } from "../entities/Updoot";
import { In } from "typeorm";

export const createUpdootLoader = () =>
  new DataLoader<{ postId: number; userId: number }, Updoot | null>(
    async (keys) => {
      const updoots = await Updoot.findBy({
        postId: In(keys.map((key) => key.postId)),
        userId: In(keys.map((key) => key.userId)),
      });

      const updootIdsToUpdoot: Record<string, Updoot> ={};

      updoots.forEach(u => {
        updootIdsToUpdoot[`${u.userId}|${u.postId}`] = u;
      })

      return keys.map(key => updootIdsToUpdoot[`${key.userId}|${key.postId}`])
    }
  );
