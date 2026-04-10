import { StatCard } from "../ui/stat-card";
import { ArrowRightIcon } from "../ui/icons";

export type StatsBarProps = {
  openPositions?: number;
  applications?: number;
  firstCall?: { value: number; total: number };
  secondCall?: { value: number; total: number };
  tasks?: { value: number; total: number };
  proposals?: number;
  hires?: number;
};

export function StatsBar({
  openPositions = 5,
  applications = 240,
  firstCall = { value: 38, total: 40 },
  secondCall = { value: 12, total: 20 },
  tasks = { value: 10, total: 11 },
  proposals = 10,
  hires = 0,
}: StatsBarProps) {
  return (
    <div className="flex items-start gap-10 px-6 py-5 border-b border-gray-200">
      <StatCard
        value={openPositions}
        label="Open positions"
        action={
          <button className="flex items-center gap-0.5 text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
            View <ArrowRightIcon className="text-gray-400" />
          </button>
        }
      />
      <StatCard value={applications} label="Applications" />
      <StatCard value={firstCall.value} total={firstCall.total} label="1st Call" loading />
      <StatCard value={secondCall.value} total={secondCall.total} label="2nd Call" loading />
      <StatCard value={tasks.value} total={tasks.total} label="Task" loading />
      <StatCard value={proposals} label="Proposals" />
      <StatCard value={hires} label="Hires" />
    </div>
  );
}
