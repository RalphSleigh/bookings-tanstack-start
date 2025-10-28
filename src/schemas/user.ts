import { z } from "zod/v4";

export const UserSchema = z.object({
  id: z.string().optional(),
  sub: z.string(),
  name: z.string(),
  email: z.email(),
  avatar: z.string().optional(),
  isWoodcraft: z.boolean(),
  isGroupAccount: z.boolean(),
  preferences: z.object({
    emailNopeList: z.array(z.uuidv7()).default([]),
    driveSyncList: z.array(z.uuidv7()).default([]),
  }).default({ emailNopeList: [], driveSyncList: [] }),
});

export type TUser = z.infer<typeof UserSchema>;