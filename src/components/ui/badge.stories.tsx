import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./badge";

const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  args: { count: 4 },
};
export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {};
export const Danger: Story = { args: { variant: "danger", count: 3 } };
export const LargeNumber: Story = { args: { count: 42 } };
