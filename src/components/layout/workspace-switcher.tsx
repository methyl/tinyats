import { useState, useRef, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useWorkspace } from "@/lib/workspace-context";
import { ChevronDownIcon } from "../ui/icons";

export function WorkspaceSwitcher() {
  const {
    currentOrg,
    currentWorkspace,
    orgMemberships,
    switchOrg,
    switchWorkspace,
    isOrgAdmin,
  } = useWorkspace();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const orgs = orgMemberships
    .map((m: any) => m.organization)
    .filter(Boolean)
    .filter((org: any, i: number, arr: any[]) => arr.findIndex((o: any) => o.id === org.id) === i);

  const currentOrgWorkspaces =
    orgMemberships.find((m: any) => m.organization?.id === currentOrg?.id)?.organization
      ?.workspaces ?? [];

  const initials = currentOrg?.name
    ? currentOrg.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "??";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
      >
        <span className="w-6 h-6 rounded bg-gray-800 text-white text-xs font-bold flex items-center justify-center">
          {initials}
        </span>
        <span className="text-sm font-medium text-gray-800">
          {currentOrg?.name ?? "Loading..."}
        </span>
        <ChevronDownIcon className="text-gray-400 w-3 h-3" />
        {currentWorkspace && (
          <>
            <span className="text-gray-300">/</span>
            <span className="text-sm text-gray-600">{currentWorkspace.name}</span>
          </>
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl border border-gray-200 shadow-sm z-50 py-1">
          {/* Organizations */}
          <div className="px-3 py-1.5 text-xs font-medium text-gray-400 uppercase tracking-wider">
            Organizations
          </div>
          {orgs.map((org: any) => (
            <button
              key={org.id}
              onClick={() => {
                switchOrg(org.id);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer flex items-center gap-2 ${
                org.id === currentOrg?.id ? "text-gray-900 font-medium" : "text-gray-600"
              }`}
            >
              <span className="w-5 h-5 rounded bg-gray-200 text-gray-600 text-[10px] font-bold flex items-center justify-center">
                {org.name
                  .split(" ")
                  .map((w: string) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
              {org.name}
              {org.id === currentOrg?.id && (
                <span className="ml-auto text-blue-500">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              )}
            </button>
          ))}

          <div className="border-t border-gray-100 my-1" />

          {/* Workspaces */}
          <div className="px-3 py-1.5 text-xs font-medium text-gray-400 uppercase tracking-wider">
            Workspaces
          </div>
          {currentOrgWorkspaces.map((ws: any) => (
            <button
              key={ws.id}
              onClick={() => {
                switchWorkspace(ws.id);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer ${
                ws.id === currentWorkspace?.id ? "text-gray-900 font-medium" : "text-gray-600"
              }`}
            >
              {ws.name}
              {ws.id === currentWorkspace?.id && (
                <span className="ml-auto float-right text-blue-500">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              )}
            </button>
          ))}

          <div className="border-t border-gray-100 my-1" />
          {isOrgAdmin && (
            <button className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 cursor-pointer">
              + Create workspace
            </button>
          )}
          <button
            onClick={() => {
              navigate({ to: "/settings" });
              setOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 cursor-pointer"
          >
            Settings
          </button>
        </div>
      )}
    </div>
  );
}
