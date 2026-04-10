import type { Meta, StoryObj } from "@storybook/react";
import { KanbanCard } from "./kanban-card";
import { mockKanbanCandidates } from "./mock-data";

const meta: Meta<typeof KanbanCard> = {
  title: "Candidates/KanbanCard",
  component: KanbanCard,
  parameters: { layout: "centered" },
  decorators: [(Story) => <div className="w-[220px]"><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof KanbanCard>;

export const Default: Story = {
  args: { candidate: mockKanbanCandidates[0] },
};

export const WithNote: Story = {
  args: { candidate: mockKanbanCandidates[0] },
};

export const WithStars: Story = {
  args: { candidate: mockKanbanCandidates[4] },
};

export const WithCalendar: Story = {
  args: { candidate: mockKanbanCandidates[8] },
};

export const Dragging: Story = {
  args: { candidate: mockKanbanCandidates[0], isDragging: true },
};

export const AllVariants: Story = {
  decorators: [(Story) => <div className="flex gap-4 flex-wrap max-w-4xl"><Story /></div>],
  render: () => (
    <>
      {mockKanbanCandidates.slice(0, 6).map((c) => (
        <div key={c.id} className="w-[220px]">
          <KanbanCard candidate={c} />
        </div>
      ))}
    </>
  ),
};
