import type { Meta, StoryObj } from "@storybook/react";
import { IconButton } from "./icon-button";

const GridIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <rect x="1" y="1" width="6" height="6" rx="1" />
    <rect x="9" y="1" width="6" height="6" rx="1" />
    <rect x="1" y="9" width="6" height="6" rx="1" />
    <rect x="9" y="9" width="6" height="6" rx="1" />
  </svg>
);

const ListIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 4h12M2 8h12M2 12h12" />
  </svg>
);

const meta: Meta<typeof IconButton> = {
  title: "UI/IconButton",
  component: IconButton,
  args: { icon: GridIcon, label: "Grid view" },
};
export default meta;
type Story = StoryObj<typeof IconButton>;

export const Default: Story = {};
export const Active: Story = { args: { active: true, icon: ListIcon, label: "List view" } };
