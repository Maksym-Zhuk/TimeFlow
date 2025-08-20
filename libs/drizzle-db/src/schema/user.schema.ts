import { text } from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { uuid } from 'drizzle-orm/pg-core';
import { profileInfo } from './profileInfo.schema';
import { Role } from '@time-flow/shared-backend';

// this import is used for migrations
// import { Role } from '../../../shared-backend/src/enums/Role.enum';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull(),
  password: text('password').notNull(),
  role: text('role').$type<Role>().notNull().default(Role.USER),
});

export const userRelation = relations(users, ({ one }) => ({
  profile: one(profileInfo, {
    fields: [users.id],
    references: [profileInfo.userId],
  }),
}));
