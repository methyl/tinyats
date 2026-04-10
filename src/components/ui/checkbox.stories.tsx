import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "./checkbox";

const meta: Meta<typeof Checkbox> = {
  title: "UI/Checkbox",
  component: Checkbox,
};
export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Unchecked: Story = { args: { checked: false } };
export const Checked: Story = { args: { checked: true } };
export const Indeterminate: Story = { args: { indeterminate: true } };
