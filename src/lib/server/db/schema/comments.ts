import { pgTable, serial, text, uuid, timestamp } from 'drizzle-orm/pg-core';
import { posts } from './posts';
import { users } from './users';

// Comment table
export const comments = pgTable('comment', {
  id: serial('id').primaryKey(),
  text: text('text').notNull(),
  postId: uuid('post_id')
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

