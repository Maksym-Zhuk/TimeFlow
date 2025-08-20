import { uuid } from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';
import { users } from './user.schema';
import { relations } from 'drizzle-orm';
import { text } from 'drizzle-orm/pg-core';

export const profileInfo = pgTable('profileInfo', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('userId')
    .references(() => users.id)
    .unique(),
  firstName: text('firstName').notNull(),
  lastName: text('lastName').notNull(),
  description: text('description').notNull().default(''),
  avatarUrl: text('avatarUrl').notNull().default(''),
});

export const profileInfoRelation = relations(profileInfo, ({ one }) => ({
  userId: one(users, {
    fields: [profileInfo.userId],
    references: [users.id],
  }),
}));
