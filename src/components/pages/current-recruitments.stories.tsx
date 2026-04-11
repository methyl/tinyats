import type { Meta, StoryObj } from "@storybook/react";
import { CurrentRecruitments } from "./current-recruitments";

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

// Note: This story requires VITE_INSTANT_APP_ID to be set.
// In Storybook, it will show the loading/error state if not connected.
export const Default: Story = {};
