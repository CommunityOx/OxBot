import { relations } from "drizzle-orm/relations";
import { user, warn } from "./schema";

export const warnRelations = relations(warn, ({one}) => ({
	user: one(user, {
		fields: [warn.targetId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	warns: many(warn),
}));