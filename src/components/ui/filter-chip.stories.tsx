import type { Meta, StoryObj } from "@storybook/react";
import { FilterChip } from "./filter-chip";

const meta: Meta<typeof FilterChip> = {
  title: "UI/FilterChip",
  component: FilterChip,
};
export default meta;
type Story = StoryObj<typeof FilterChip>;

export const Default: Story = { args: { children: "New" } };
export const Active: Story = { args: { children: "New", active: true } };
export const WithCount: Story = { args: { children: "Call today", count: 4 } };
export const WithZeroCount: Story = { args: { children: "Updated", count: 0, showCount: true } };

export const WithIcon: Story = {
  args: {
    children: "Above 4 stars",
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="#D9AC00" stroke="#D9AC00" strokeWidth="0.5">
        <path d="M8 1.5L9.79 5.12L13.76 5.7L10.88 8.5L11.58 12.45L8 10.56L4.42 12.45L5.12 8.5L2.24 5.7L6.21 5.12L8 1.5Z" />
      </svg>
    ),
  },
};

export const ToolbarRow: Story = {
  render: () => (
    <div className="flex gap-2 items-center">
      <FilterChip>New</FilterChip>
      <FilterChip count={4}>Call today</FilterChip>
      <FilterChip
        icon={
          <svg width="14" height="14" viewBox="0 0 16 16" fill="#D9AC00" stroke="#D9AC00" strokeWidth="0.5">
            <path d="M8 1.5L9.79 5.12L13.76 5.7L10.88 8.5L11.58 12.45L8 10.56L4.42 12.45L5.12 8.5L2.24 5.7L6.21 5.12L8 1.5Z" />
          </svg>
        }
      >
        Above 4 stars
      </FilterChip>
      <FilterChip count={0} showCount>Updated</FilterChip>
    </div>
  ),
};
