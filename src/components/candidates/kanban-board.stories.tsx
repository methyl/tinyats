import type { Meta, StoryObj } from "@storybook/react";
import { KanbanBoard } from "./kanban-board";
import { mockKanbanCandidates } from "./mock-data";

const meta: Meta<typeof KanbanBoard> = {
  title: "Candidates/KanbanBoard",
  component: KanbanBoard,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof KanbanBoard>;

export const Default: Story = {
  args: { candidates: mockKanbanCandidates },
};
