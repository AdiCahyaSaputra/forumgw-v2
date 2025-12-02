import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';
import { anonymous } from './anonymous';
import { groups } from './groups';

// Post table
export const posts = pgTable('post', {
  id: uuid('id').primaryKey().defaultRandom(),
  content: varchar('content', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  anonymousId: uuid('anonymous_id').references(() => anonymous.id, { onDelete: 'cascade' }),
  groupId: uuid('group_id').references(() => groups.id, { onDelete: 'cascade' })
});

