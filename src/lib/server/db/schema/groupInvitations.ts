import { pgTable, serial, uuid } from 'drizzle-orm/pg-core';
import { groups } from './groups';
import { users } from './users';

// Group Invitation table
export const groupInvitations = pgTable('group_invitation', {
  id: serial('id').primaryKey(),
  groupId: uuid('group_id')
    .notNull()
    .references(() => groups.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
});

