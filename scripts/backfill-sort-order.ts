import { init } from "@instantdb/admin";
import schema from "../src/instant.schema";

const adminDb = init({
  appId: process.env.VITE_INSTANT_APP_ID!,
  adminToken: process.env.INSTANT_ADMIN_TOKEN!,
  schema,
});

async function backfill() {
  const { candidates } = await adminDb.query({ candidates: {} });

  // Group by status, assign sortOrder within each group
  const byStatus: Record<string, typeof candidates> = {};
  for (const c of candidates) {
    (byStatus[c.status] ??= []).push(c);
  }

  const txs = [];
  for (const [, group] of Object.entries(byStatus)) {
    for (let i = 0; i < group.length; i++) {
      txs.push(adminDb.tx.candidates[group[i].id].update({ sortOrder: i * 1000 }));
    }
  }

  await adminDb.transact(txs);
  console.log(`Backfilled sortOrder for ${txs.length} candidates.`);
}

backfill().catch(console.error);
