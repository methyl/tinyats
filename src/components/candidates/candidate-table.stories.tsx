import type { Meta, StoryObj } from "@storybook/react";
import { CandidateTable } from "./candidate-table";
import { mockCandidates } from "./mock-data";

const meta: Meta<typeof CandidateTable> = {
  title: "Candidates/CandidateTable",
  component: CandidateTable,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof CandidateTable>;

export const Default: Story = {
  args: { candidates: mockCandidates },
};

export const Empty: Story = {
  args: { candidates: [] },
};

export const FewCandidates: Story = {
  args: { candidates: mockCandidates.slice(0, 3) },
};
