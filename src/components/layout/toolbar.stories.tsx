import type { Meta, StoryObj } from "@storybook/react";
import { Toolbar } from "./toolbar";

const meta: Meta<typeof Toolbar> = {
  title: "Layout/Toolbar",
  component: Toolbar,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof Toolbar>;

export const Default: Story = {};
export const GridView: Story = { args: { view: "grid" } };
