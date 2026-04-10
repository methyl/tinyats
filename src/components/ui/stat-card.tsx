import { type ReactNode } from "react";

export type StatCardProps = {
  value: number;
  total?: number;
  label: string;
  loading?: boolean;
  action?: ReactNode;
};

function Spinner() {
  return (
    <svg className="animate-spin ml-1" width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6" stroke="#E7E9E7" strokeWidth="2" />
      <path d="M7 1a6 6 0 0 1 6 6" stroke="#8E8E8F" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function StatCard({ value, total, label, loading, action }: StatCardProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline gap-0.5">
        <span className="text-2xl font-semibold text-gray-900">{value}</span>
        {total != null && (
          <span className="text-2xl text-gray-500 font-light">/{total}</span>
        )}
        {loading && <Spinner />}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">{label}</span>
        {action}
      </div>
    </div>
  );
}
