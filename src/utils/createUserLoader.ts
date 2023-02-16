import DataLoader from "dataloader";
import { BUser } from '../entities/User';
import { In } from 'typeorm'

export const createUserLoader = () => new DataLoader<number, BUser>(async keys => {
  const users = await BUser.findBy({id: In(keys)});
  const userIdToUser: Record<number, BUser> = {};
  users.forEach((u) => {
    userIdToUser[u.id] = u;
  })

  return keys.map((userId) => userIdToUser[userId]);
});