import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Toolbar, defaultFilters, type ActiveFilters } from "./toolbar";

const meta: Meta<typeof Toolbar> = {
  title: "Layout/Toolbar",
  component: Toolbar,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof Toolbar>;

export const Interactive: Story = {
  render: () => {
    const [filters, setFilters] = useState<ActiveFilters>(defaultFilters);
    const [view, setView] = useState<"grid" | "list">("list");
    return (
      <div>
        <Toolbar
          view={view}
          onViewChange={setView}
          filters={filters}
          onFiltersChange={setFilters}
          callTodayCount={4}
          positions={["Data Engineer", "Frontend Developer", "Backend Developer"]}
        />
        <div className="p-4 text-sm text-gray-500">
          Active: {JSON.stringify(filters)}
        </div>
      </div>
    );
  },
};
