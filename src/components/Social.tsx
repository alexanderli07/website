import { type ReactElement } from "react";
import { socials } from "../data/content";

export function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M12 .5C5.37.5 0 5.78 0 12.29c0 5.2 3.44 9.6 8.2 11.16.6.11.82-.25.82-.56v-2.02c-3.34.72-4.04-1.6-4.04-1.6-.55-1.37-1.34-1.74-1.34-1.74-1.1-.74.08-.73.08-.73 1.2.08 1.84 1.22 1.84 1.22 1.07 1.8 2.8 1.28 3.49.98.11-.76.42-1.28.76-1.58-2.67-.3-5.47-1.31-5.47-5.84 0-1.29.47-2.34 1.24-3.17-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.21a11.5 11.5 0 0 1 6 0c2.28-1.53 3.29-1.21 3.29-1.21.66 1.66.25 2.88.12 3.18.77.83 1.24 1.88 1.24 3.17 0 4.54-2.81 5.53-5.49 5.83.43.37.81 1.1.81 2.22v3.29c0 .31.21.68.83.56C20.57 21.88 24 17.49 24 12.29 24 5.78 18.63.5 12 .5z" />
    </svg>
  );
}

export function LinkedinIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

const ICONS: Record<string, () => ReactElement> = {
  GitHub: GithubIcon,
  LinkedIn: LinkedinIcon,
};

/** Icon links for selected socials (defaults to GitHub + LinkedIn). */
export function SocialLinks({
  only = ["GitHub", "LinkedIn"],
  className = "",
}: {
  only?: string[];
  className?: string;
}) {
  const items = socials.filter((s) => only.includes(s.label) && ICONS[s.label]);
  return (
    <span className={className}>
      {items.map((s) => {
        const Icon = ICONS[s.label];
        return (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener"
            className="icon-link"
            aria-label={s.label}
            title={s.label}
          >
            <Icon />
          </a>
        );
      })}
    </span>
  );
}
