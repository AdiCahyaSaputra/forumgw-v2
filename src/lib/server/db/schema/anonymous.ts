import { pgTable, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

// Anonymous table
export const anonymous = pgTable('anonymous', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' })
});

