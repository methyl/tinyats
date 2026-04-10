import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  args: { children: "Button" },
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = { args: { variant: "primary", children: "Add Candidate" } };
export const Secondary: Story = { args: { variant: "secondary", children: "Add position" } };
export const Outline: Story = { args: { variant: "outline", children: "Filters" } };
export const Ghost: Story = { args: { variant: "ghost", children: "Filters" } };
export const Small: Story = { args: { size: "sm", variant: "outline", children: "Filters" } };

export const WithIcon: Story = {
  args: {
    variant: "secondary",
    children: "Add Candidate",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="7" cy="5" r="3" />
        <path d="M1 14c0-3.3 2.7-6 6-6s6 2.7 6 6" />
        <path d="M13 3v4M11 5h4" />
      </svg>
    ),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-3 items-center">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  ),
};
