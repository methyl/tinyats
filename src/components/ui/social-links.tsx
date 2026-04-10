export type SocialLinksProps = {
  linkedin?: string;
  github?: string;
  resume?: string;
};

function LinkedInIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="1" y="1" width="20" height="20" rx="4" fill="#0A66C2" />
      <path d="M7.5 16.5H5.2V9.5h2.3v7zM6.35 8.5a1.35 1.35 0 110-2.7 1.35 1.35 0 010 2.7zm10.15 8H14.2v-3.4c0-.8-.01-1.8-1.1-1.8-1.1 0-1.27.86-1.27 1.75v3.45H9.5V9.5h2.2v1h.03c.31-.58 1.06-1.2 2.18-1.2 2.33 0 2.76 1.53 2.76 3.53v3.67z" fill="white" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="#24292F">
      <path d="M11 1A10 10 0 001 11a10 10 0 006.84 9.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34a2.65 2.65 0 00-1.11-1.46c-.91-.62.07-.61.07-.61a2.1 2.1 0 011.53 1.03 2.13 2.13 0 002.91.83 2.13 2.13 0 01.64-1.34c-2.22-.25-4.56-1.11-4.56-4.94a3.87 3.87 0 011.03-2.68 3.6 3.6 0 01.1-2.65s.84-.27 2.75 1.02a9.47 9.47 0 015.01 0c1.91-1.29 2.75-1.02 2.75-1.02a3.6 3.6 0 01.1 2.65 3.87 3.87 0 011.02 2.68c0 3.84-2.34 4.69-4.57 4.94a2.39 2.39 0 01.68 1.85v2.75c0 .27.18.58.69.48A10 10 0 0021 11 10 10 0 0011 1z" />
    </svg>
  );
}

function ResumeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#8E8E8F" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 3H7a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7l-4-4z" />
      <path d="M13 3v4h4" />
    </svg>
  );
}

export function SocialLinks({ linkedin, github, resume }: SocialLinksProps) {
  const links = [
    { url: linkedin, icon: <LinkedInIcon />, label: "LinkedIn" },
    { url: github, icon: <GitHubIcon />, label: "GitHub" },
    { url: resume, icon: <ResumeIcon />, label: "Resume" },
  ].filter((l) => l.url);

  if (links.length === 0) return null;

  return (
    <div className="flex items-center gap-3">
      {links.map(({ url, icon, label }) => (
        <a
          key={label}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-70 transition-opacity"
          aria-label={label}
        >
          {icon}
        </a>
      ))}
    </div>
  );
}
