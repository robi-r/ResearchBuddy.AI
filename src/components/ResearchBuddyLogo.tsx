import React from "react";

interface LogoProps {
  className?: string;
  size?: number | string;
}

export function ResearchBuddyLogo({ className, size = "100%" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 220 220"
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Gradients to match the logo image colors */}
        <linearGradient id="stemGrad" x1="110" y1="50" x2="110" y2="185" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
        <linearGradient id="legGrad" x1="110" y1="130" x2="150" y2="185" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="loopGrad" x1="110" y1="50" x2="155" y2="135" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#9333EA" />
        </linearGradient>
      </defs>

      {/* 1. Main vertical stem of the "R" */}
      <line
        x1="110"
        y1="50"
        x2="110"
        y2="185"
        stroke="url(#stemGrad)"
        strokeWidth="10"
        strokeLinecap="round"
      />

      {/* 2. Diagonal leg of the "R" */}
      <line
        x1="110"
        y1="130"
        x2="150"
        y2="185"
        stroke="url(#legGrad)"
        strokeWidth="10"
        strokeLinecap="round"
      />

      {/* 3. Curved loop on the right side outlining the "R" bowl */}
      <path
        d="M 110 50 A 48 48 0 0 1 150 130"
        stroke="url(#loopGrad)"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />

      {/* 4. Left diagonal connector (underlay network lines) */}
      <line
        x1="110"
        y1="50"
        x2="65"
        y2="130"
        stroke="#818CF8"
        strokeWidth="6"
        strokeOpacity="0.4"
        strokeLinecap="round"
      />

      {/* 5. Central horizontal network line connecting left and right nodes */}
      <line
        x1="65"
        y1="130"
        x2="150"
        y2="130"
        stroke="#818CF8"
        strokeWidth="6"
        strokeOpacity="0.4"
        strokeLinecap="round"
      />

      {/* 6. Right inner diagonal line */}
      <line
        x1="110"
        y1="50"
        x2="150"
        y2="130"
        stroke="#818CF8"
        strokeWidth="6"
        strokeOpacity="0.4"
        strokeLinecap="round"
      />

      {/* 7. Interactive vector nodes/circles */}
      {/* Top Node (Indigo Blue) */}
      <circle
        cx="110"
        cy="50"
        r="16"
        fill="#3B82F6"
        stroke="#4F46E5"
        strokeWidth="2"
      />

      {/* Left Node (Bright Cyan) */}
      <circle
        cx="65"
        cy="130"
        r="16"
        fill="#06B6D4"
        stroke="#0891B2"
        strokeWidth="2"
      />

      {/* Right Node (Purple Violet) */}
      <circle
        cx="150"
        cy="130"
        r="16"
        fill="#8B5CF6"
        stroke="#7C3AED"
        strokeWidth="2"
      />
    </svg>
  );
}
