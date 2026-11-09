import type { SVGProps } from "react";

export function T3Wordmark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Yudishtir Sovereign Crest"
    >
      {/* Central Spear of Truth (Yudhi-Sthira Lance) */}
      <path
        d="M16 2L18.8 8.5L17.2 14L16 16.5L14.8 14L13.2 8.5L16 2Z"
        fill="currentColor"
        className="text-primary"
      />
      <line
        x1="16"
        y1="2.5"
        x2="16"
        y2="16"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinecap="round"
        className="text-warning-foreground"
      />

      {/* Left Crown Wing forming Sovereign 'Y' */}
      <path
        d="M14.5 24L7 9.5L10 12.5L11.5 10L13.5 16L14.5 21L14.5 24Z"
        fill="currentColor"
        className="text-warning"
      />

      {/* Right Crown Wing forming Sovereign 'Y' */}
      <path
        d="M17.5 24L25 9.5L22 12.5L20.5 10L18.5 16L17.5 21L17.5 24Z"
        fill="currentColor"
        className="text-primary"
      />

      {/* Satya Diamond of Truth */}
      <polygon
        points="16,14.5 19,18 16,21.5 13,18"
        fill="currentColor"
        className="text-background"
        stroke="currentColor"
        strokeWidth="0.8"
      />
      <polygon
        points="16,15.5 17.8,18 16,20.5 14.2,18"
        fill="currentColor"
        className="text-warning"
      />

      {/* Steadfast Base Pedestal */}
      <path
        d="M16 27.5L13.5 23.5L14.5 22L16 23.5L17.5 22L18.5 23.5L16 27.5Z"
        fill="currentColor"
        className="text-primary"
      />
    </svg>
  );
}
