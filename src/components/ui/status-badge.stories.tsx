import type { Meta, StoryObj } from "@storybook/react";
import { StatusBadge } from "./status-badge";

const meta: Meta<typeof StatusBadge> = {
  title: "UI/StatusBadge",
  component: StatusBadge,
  args: { status: "New" },
};
export default meta;
type Story = StoryObj<typeof StatusBadge>;

export const New: Story = { args: { status: "New" } };
export const Reviewed: Story = { args: { status: "Reviewed" } };
export const FirstCall: Story = { args: { status: "1st Call" } };
export const SecondCall: Story = { args: { status: "2nd Call" } };
export const Deal: Story = { args: { status: "Deal" } };
export const Hired: Story = { args: { status: "Hired" } };
export const Rejected: Story = { args: { status: "Rejected" } };

export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <StatusBadge status="New" />
      <StatusBadge status="Reviewed" />
      <StatusBadge status="1st Call" />
      <StatusBadge status="2nd Call" />
      <StatusBadge status="Deal" />
      <StatusBadge status="Hired" />
      <StatusBadge status="Rejected" />
    </div>
  ),
};
