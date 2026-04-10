import type { Meta, StoryObj } from "@storybook/react";
import { StatCard } from "./stat-card";

const meta: Meta<typeof StatCard> = {
  title: "UI/StatCard",
  component: StatCard,
};
export default meta;
type Story = StoryObj<typeof StatCard>;

export const Simple: Story = {
  args: { value: 5, label: "Open positions" },
};

export const WithTotal: Story = {
  args: { value: 38, total: 40, label: "1st Call", loading: true },
};

export const WithAction: Story = {
  args: {
    value: 5,
    label: "Open positions",
    action: (
      <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
        View
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4.5 3L7.5 6L4.5 9" />
        </svg>
      </button>
    ),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-12">
      <StatCard value={5} label="Open positions" />
      <StatCard value={240} label="Applications" />
      <StatCard value={38} total={40} label="1st Call" loading />
      <StatCard value={12} total={20} label="2nd Call" loading />
      <StatCard value={10} total={11} label="Task" loading />
      <StatCard value={10} label="Proposals" />
      <StatCard value={0} label="Hires" />
    </div>
  ),
};
