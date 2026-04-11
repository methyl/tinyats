import { Badge } from "../ui/badge";
import { SearchInput } from "../ui/search-input";
import { ChevronDownIcon } from "../ui/icons";
import { db } from "@/lib/db";

export type TopNavTab = {
  label: string;
  badge?: number;
  active?: boolean;
};

export type TopNavProps = {
  teamName?: string;
  tabs?: TopNavTab[];
  onTabClick?: (label: string) => void;
  onSearch?: (query: string) => void;
};

export function TopNav({
  teamName = "Your team",
  tabs = [
    { label: "Current Recruitments", active: true },
    { label: "Tasks", badge: 4 },
    { label: "Past candidates" },
  ],
  onTabClick,
  onSearch,
}: TopNavProps) {
  return (
    <nav className="flex items-center justify-between h-14 px-4 bg-white border-b border-gray-200">
      <div className="flex items-center gap-1">
        {/* Team selector */}
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
          <span className="w-6 h-6 rounded bg-gray-800 text-white text-xs font-bold flex items-center justify-center">
            {teamName
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </span>
          <span className="text-sm font-medium text-gray-800">{teamName}</span>
          <ChevronDownIcon className="text-gray-500" />
        </button>

        {/* Tabs */}
        <div className="flex items-center ml-4 gap-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => onTabClick?.(tab.label)}
              className={`
                flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
                transition-colors cursor-pointer
                ${
                  tab.active
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                }
              `}
            >
              {tab.label}
              {tab.badge != null && <Badge count={tab.badge} />}
            </button>
          ))}
        </div>
      </div>

      {/* Search + Sign out */}
      <div className="flex items-center gap-3">
        <SearchInput onChange={onSearch} />
        <button
          onClick={() => db.auth.signOut()}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer whitespace-nowrap"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
