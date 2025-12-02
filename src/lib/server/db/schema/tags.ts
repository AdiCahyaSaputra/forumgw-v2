import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';

// Tag table
export const tags = pgTable('tag', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull()
});

