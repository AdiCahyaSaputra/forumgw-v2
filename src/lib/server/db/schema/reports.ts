import { pgTable, serial, text, uuid } from 'drizzle-orm/pg-core';
import { posts } from './posts';

// Report table
export const reports = pgTable('report', {
  id: serial('id').primaryKey(),
  reason: text('reason').notNull(),
  postId: uuid('post_id')
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade' })
});

