import { Firestore } from "@google-cloud/firestore";
import { TUser, UserSchema } from "../schemas/user";
import { FirestoreRepository } from '@spacelabstech/firestoreorm';

const firestore = new Firestore({
  databaseId: 'bookings',
})

export const userRepo = FirestoreRepository.withSchema<TUser>(
  firestore,
  'users',
  UserSchema
);