import { i } from "@instantdb/react";

const _schema = i.schema({
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
      imageURL: i.string().optional(),
      type: i.string().optional(),
    }),
    candidates: i.entity({
      name: i.string().indexed(),
      status: i.string().indexed(),
      rating: i.number().indexed(),
      linkedin: i.string().optional(),
      github: i.string().optional(),
      resume: i.string().optional(),
      phone: i.string().optional(),
      email: i.string(),
      note: i.string().optional(),
      dateAdded: i.number().indexed(),
      hasCalendarEvent: i.boolean().optional(),
      activityLevel: i.string().optional(),
      sortOrder: i.number().indexed(),
    }),
    positions: i.entity({
      name: i.string().indexed(),
    }),
  },
  links: {
    $usersLinkedPrimaryUser: {
      forward: {
        on: "$users",
        has: "one",
        label: "linkedPrimaryUser",
        onDelete: "cascade",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "linkedGuestUsers",
      },
    },
    candidatePosition: {
      forward: {
        on: "candidates",
        has: "one",
        label: "position",
      },
      reverse: {
        on: "positions",
        has: "many",
        label: "candidates",
      },
    },
  },
});

type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
