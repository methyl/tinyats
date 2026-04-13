import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { CandidateDrawer } from "./candidate-drawer";
import { mockCandidates } from "./mock-data";
import { type Candidate } from "./types";

const positions = Array.from(
  new Set(mockCandidates.map((c) => c.position).filter(Boolean)),
).sort();

function DrawerHarness({
  initialId = mockCandidates[0].id,
  candidates = mockCandidates,
  hasEditAccess = true,
  hasCommentAccess = true,
}: {
  initialId?: string;
  candidates?: Candidate[];
  hasEditAccess?: boolean;
  hasCommentAccess?: boolean;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(initialId);
  const selected = candidates.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md space-y-2">
        <div className="text-sm text-gray-500 mb-2">Click a candidate to open the drawer:</div>
        {candidates.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedId(c.id)}
            className="w-full text-left px-3 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50"
          >
            <div className="font-medium text-gray-900">{c.name}</div>
            <div className="text-xs text-gray-500">
              {c.position} · {c.status}
            </div>
          </button>
        ))}
      </div>

      <CandidateDrawer
        candidate={selected}
        candidates={candidates}
        onClose={() => setSelectedId(null)}
        onSelect={setSelectedId}
        positions={positions}
        hasEditAccess={hasEditAccess}
        hasCommentAccess={hasCommentAccess}
        // No currentUserId → skip the CommentSection (it needs workspace context)
      />
    </div>
  );
}

const meta: Meta<typeof DrawerHarness> = {
  title: "Candidates/CandidateDrawer",
  component: DrawerHarness,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof DrawerHarness>;

export const Default: Story = {
  args: { initialId: mockCandidates[0].id },
};

export const HotCandidate: Story = {
  args: { initialId: mockCandidates[3].id },
};

export const ReadOnly: Story = {
  args: {
    initialId: mockCandidates[0].id,
    hasEditAccess: false,
    hasCommentAccess: false,
  },
};

export const FirstInList: Story = {
  args: { initialId: mockCandidates[0].id },
};

export const MiddleOfList: Story = {
  args: { initialId: mockCandidates[4].id },
};

export const LastInList: Story = {
  args: { initialId: mockCandidates[mockCandidates.length - 1].id },
};
