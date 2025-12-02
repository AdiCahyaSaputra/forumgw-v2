import { pgTable, uuid, varchar, text, integer } from 'drizzle-orm/pg-core';
import { roles } from './roles';

// User table
export const users = pgTable('user', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username').notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: 20 }).notNull(),
  image: text('image'),
  bio: varchar('bio', { length: 100 }),
  roleId: integer('role_id').references(() => roles.id)
});

