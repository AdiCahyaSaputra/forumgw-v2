import { pgTable, uuid, varchar, text } from 'drizzle-orm/pg-core';
import { users } from './users';

// Group table
export const groups = pgTable('group', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name').notNull(),
  description: text('description').notNull(),
  logo: text('logo'),
  leaderId: uuid('leader_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
});

