import { init } from "@instantdb/react";
import schema from "../instant.schema";

// Falls back to a placeholder UUID so component imports don't crash in environments
// where the env var isn't set (e.g. Storybook). At runtime the app shell still
// requires VITE_INSTANT_APP_ID to be set for queries/auth to work against a real app.
const appId =
  import.meta.env.VITE_INSTANT_APP_ID ??
  "00000000-0000-0000-0000-000000000000";

export const db = init({ appId, schema });
