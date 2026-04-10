import type { Meta, StoryObj } from "@storybook/react";
import { StatsBar } from "./stats-bar";

const meta: Meta<typeof StatsBar> = {
  title: "Layout/StatsBar",
  component: StatsBar,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof StatsBar>;

export const Default: Story = {};
