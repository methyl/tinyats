import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { StarRating } from "./star-rating";

const meta: Meta<typeof StarRating> = {
  title: "UI/StarRating",
  component: StarRating,
  args: { rating: 3, maxStars: 5 },
};
export default meta;
type Story = StoryObj<typeof StarRating>;

export const Empty: Story = { args: { rating: 0 } };
export const ThreeStars: Story = { args: { rating: 3 } };
export const FiveStars: Story = { args: { rating: 5 } };
export const ReadOnly: Story = { args: { rating: 4, readOnly: true } };

export const Interactive: Story = {
  render: () => {
    const [rating, setRating] = useState(2);
    return (
      <div className="flex flex-col gap-2">
        <StarRating rating={rating} onChange={setRating} />
        <span className="text-sm text-gray-500">Rating: {rating}</span>
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => {
    const [sm, setSm] = useState(3);
    const [md, setMd] = useState(3);
    const [lg, setLg] = useState(3);
    return (
      <div className="flex flex-col gap-4">
        <StarRating rating={sm} size="sm" onChange={setSm} />
        <StarRating rating={md} size="md" onChange={setMd} />
        <StarRating rating={lg} size="lg" onChange={setLg} />
      </div>
    );
  },
};
