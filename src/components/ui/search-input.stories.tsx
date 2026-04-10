import type { Meta, StoryObj } from "@storybook/react";
import { SearchInput } from "./search-input";

const meta: Meta<typeof SearchInput> = {
  title: "UI/SearchInput",
  component: SearchInput,
};
export default meta;
type Story = StoryObj<typeof SearchInput>;

export const Default: Story = {};
export const WithValue: Story = { args: { value: "John" } };
export const CustomPlaceholder: Story = { args: { placeholder: "Search candidates..." } };
