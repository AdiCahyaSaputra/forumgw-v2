import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';

// Role table
export const roles = pgTable('role', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull().unique()
});

