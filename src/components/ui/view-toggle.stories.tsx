import type { Meta, StoryObj } from "@storybook/react";
import { ViewToggle } from "./view-toggle";

const meta: Meta<typeof ViewToggle> = {
  title: "UI/ViewToggle",
  component: ViewToggle,
  args: { view: "list" },
};
export default meta;
type Story = StoryObj<typeof ViewToggle>;

export const ListView: Story = { args: { view: "list" } };
export const GridView: Story = { args: { view: "grid" } };
