import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  integer,
  boolean,
  uuid
} from 'drizzle-orm/pg-core';

// User table
export const users = pgTable('user', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username').notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: 20 }).notNull(),
  image: text('image'),
  bio: varchar('bio', { length: 100 }),
  roleId: integer('role_id').references(() => roles.id)
});

// Role table
export const roles = pgTable('role', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull().unique()
});

// Anonymous table
export const anonymous = pgTable('anonymous', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username').notNull(),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' })
});

// Category table
export const categories = pgTable('category', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull()
});

// Tag table
export const tags = pgTable('tag', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull()
});

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

// Post table
export const posts = pgTable('post', {
  id: uuid('id').primaryKey().defaultRandom(),
  content: varchar('content', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  categoryId: integer('category_id')
    .notNull()
    .references(() => categories.id),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  anonymousId: uuid('anonymous_id').references(() => anonymous.id, { onDelete: 'cascade' }),
  groupId: uuid('group_id').references(() => groups.id, { onDelete: 'cascade' })
});

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

// Reply Comment table
export const replyComments = pgTable('reply_comment', {
  id: serial('id').primaryKey(),
  text: text('text').notNull(),
  commentId: integer('comment_id')
    .notNull()
    .references(() => comments.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Report table
export const reports = pgTable('report', {
  id: serial('id').primaryKey(),
  reason: text('reason').notNull(),
  postId: uuid('post_id')
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade' })
});

// Notification table
export const notifications = pgTable('notification', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: varchar('type').notNull(), // report, comment, mention, reply
  isRead: boolean('is_read').notNull().default(false),
  toUser: varchar('to_user').notNull(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  postId: uuid('post_id')
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade' }),
  commentId: integer('comment_id').references(() => comments.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// JWT table
export const jwts = pgTable('jwt', {
  id: uuid('id').primaryKey().defaultRandom(),
  expiredIn: timestamp('expired_in').notNull(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
});

// Group Member table
export const groupMembers = pgTable('group_member', {
  id: serial('id').primaryKey(),
  groupId: uuid('group_id')
    .notNull()
    .references(() => groups.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
});

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

// Group Join Request table
export const groupJoinRequests = pgTable('group_join_request', {
  id: serial('id').primaryKey(),
  groupId: uuid('group_id')
    .notNull()
    .references(() => groups.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
});

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
