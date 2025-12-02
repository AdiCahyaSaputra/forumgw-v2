import { pgTable, serial, integer, uuid } from 'drizzle-orm/pg-core';
import { tags } from './tags';
import { posts } from './posts';

// Tag Post relation table (many-to-many)
export const tagPosts = pgTable('tag_post', {
  id: serial('id').primaryKey(),
  tagId: integer('tag_id')
    .notNull()
    .references(() => tags.id, { onDelete: 'cascade' }),
  postId: uuid('post_id')
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade' })
});

