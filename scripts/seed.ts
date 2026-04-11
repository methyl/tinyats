import { init, id } from "@instantdb/admin";
import schema from "../src/instant.schema";

const adminDb = init({
  appId: process.env.VITE_INSTANT_APP_ID!,
  adminToken: process.env.INSTANT_ADMIN_TOKEN!,
  schema,
});

const POSITIONS = [
  { id: id(), name: "Position" },
  { id: id(), name: "Data Engineer" },
  { id: id(), name: "Frontend Developer" },
  { id: id(), name: "Backend Developer" },
];

const STATUSES = ["New", "Reviewed", "1st Call", "2nd Call", "Deal", "Hired", "Rejected"] as const;

function randomFrom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const names = [
  "Alice Johnson", "Bob Smith", "Clara Davis", "David Wilson",
  "Eva Martinez", "Frank Brown", "Grace Lee", "Henry Taylor",
  "Iris Anderson", "Jack Thomas", "Karen White", "Leo Harris",
  "Maya Clark", "Noah Lewis", "Olivia Robinson", "Paul Walker",
  "Quinn Hall", "Rachel Young", "Sam King", "Tina Wright",
];

function daysAgo(n: number): number {
  return Date.now() - n * 86400000;
}

async function seed() {
  console.log("Seeding positions...");
  const posTxs = POSITIONS.map((p) =>
    adminDb.tx.positions[p.id].update({ name: p.name })
  );
  await adminDb.transact(posTxs);

  console.log("Seeding candidates...");
  const candidateTxs = names.map((name, i) => {
    const cId = id();
    const status = STATUSES[i % STATUSES.length];
    const pos = POSITIONS[i % POSITIONS.length];
    const days = Math.floor(Math.random() * 30);
    const rating = Math.floor(Math.random() * 6); // 0-5

    return adminDb.tx.candidates[cId]
      .update({
        name,
        status,
        rating,
        email: `${name.toLowerCase().replace(" ", ".")}@mail.com`,
        linkedin: Math.random() > 0.3 ? `https://linkedin.com/in/${name.toLowerCase().replace(" ", "-")}` : undefined,
        github: Math.random() > 0.4 ? `https://github.com/${name.toLowerCase().replace(" ", "")}` : undefined,
        resume: Math.random() > 0.5 ? `https://example.com/resume/${cId}.pdf` : undefined,
        phone: Math.random() > 0.4 ? `+48 ${String(Math.floor(Math.random() * 900000000 + 100000000))}` : undefined,
        note: Math.random() > 0.6 ? `Note about ${name}, great candidate with strong background...` : undefined,
        dateAdded: daysAgo(days),
        hasCalendarEvent: status === "1st Call" || status === "2nd Call" ? Math.random() > 0.5 : false,
        activityLevel: randomFrom(["hot", "warm", "recent", "normal", "cold"]),
      })
      .link({ position: pos.id });
  });

  await adminDb.transact(candidateTxs);

  console.log(`Seeded ${POSITIONS.length} positions and ${names.length} candidates.`);
}

seed().catch(console.error);
