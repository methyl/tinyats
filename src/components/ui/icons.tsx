export function ChevronDownIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M3 4.5L6 7.5L9 4.5" />
    </svg>
  );
}

export function ArrowRightIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 3l4 4-4 4" />
    </svg>
  );
}

export function FilterIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M2 4h12M4 8h8M6 12h4" />
    </svg>
  );
}

export function SortIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
      <path d="M3 4l3-3 3 3M3 8l3 3 3-3" />
    </svg>
  );
}

export function PhoneIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="1" width="7" height="12" rx="1.5" />
      <path d="M6 11h2" />
    </svg>
  );
}

export function MailIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="12" height="8" rx="1.5" />
      <path d="M1 4l6 4 6-4" />
    </svg>
  );
}

export function NoteIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 1H4a1.5 1.5 0 00-1.5 1.5v9A1.5 1.5 0 004 13h6a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0010 1z" />
      <path d="M5.5 5h3M5.5 7.5h3M5.5 10h1.5" />
    </svg>
  );
}

export function MoreIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="8" cy="3" r="1.2" />
      <circle cx="8" cy="8" r="1.2" />
      <circle cx="8" cy="13" r="1.2" />
    </svg>
  );
}

export function AddPersonIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="5" r="3" />
      <path d="M1 14c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path d="M13 3v4M11 5h4" />
    </svg>
  );
}

export function AddIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M8 3v10M3 8h10" />
    </svg>
  );
}

export function CalendarIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="2.5" width="11" height="10" rx="1.5" />
      <path d="M4.5 1v2.5M9.5 1v2.5M1.5 6h11" />
    </svg>
  );
}

export function HelpIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="7" />
      <path d="M6 6a2 2 0 114 0c0 1-1 1.5-2 2M8 11.5v.5" />
    </svg>
  );
}

export function GoogleMeetIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="3" width="9" height="10" rx="1" fill="#00AC47" />
      <path d="M10 5.5l4-2.5v10l-4-2.5" fill="#00832D" />
      <rect x="3" y="6" width="2" height="4" rx="0.5" fill="white" />
      <rect x="6" y="6" width="2" height="4" rx="0.5" fill="white" />
    </svg>
  );
}
