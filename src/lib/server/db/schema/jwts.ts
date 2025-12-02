import { pgTable, uuid, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

// JWT table
export const jwts = pgTable('jwt', {
  id: uuid('id').primaryKey().defaultRandom(),
  expiredIn: timestamp('expired_in').notNull(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
});

