import type { Meta, StoryObj } from "@storybook/react";
import { CurrentRecruitments } from "./current-recruitments";
import { mockCandidates, mockKanbanCandidates } from "../candidates/mock-data";

const meta: Meta<typeof CurrentRecruitments> = {
  title: "Pages/CurrentRecruitments",
  component: CurrentRecruitments,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
};
export default meta;
type Story = StoryObj<typeof CurrentRecruitments>;

export const ListView: Story = {
  args: { candidates: mockCandidates, kanbanCandidates: mockKanbanCandidates },
};

export const KanbanView: Story = {
  args: { candidates: mockCandidates, kanbanCandidates: mockKanbanCandidates },
};
