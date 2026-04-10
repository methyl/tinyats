import type { Meta, StoryObj } from "@storybook/react";
import { TopNav } from "./top-nav";

const meta: Meta<typeof TopNav> = {
  title: "Layout/TopNav",
  component: TopNav,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof TopNav>;

export const Default: Story = {};
