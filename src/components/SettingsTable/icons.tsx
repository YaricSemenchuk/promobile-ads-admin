import React from "react";

/**
 * Sort control (Figma "Arrow - both", 113:5071) — exact Figma glyph: two
 * rounded 7.2x4.8 triangles with a 2px gap, centered in a 16x24 slot.
 * `upClassName`/`downClassName` highlight one half for the active direction.
 */
export const SortArrowsIcon: React.FC<{
  className?: string;
  upClassName?: string;
  downClassName?: string;
}> = ({ className, upClassName, downClassName }) => (
  <svg
    className={className}
    viewBox="0 0 16 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <g transform="translate(4.4 6.2)">
      <path
        className={upClassName}
        d="M0.547562 4.8H6.65244C7.13929 4.8 7.3831 4.11843 7.03885 3.71981L3.98641 0.185332C3.773 -0.0617775 3.427 -0.0617769 3.21359 0.185332L0.161151 3.71981C-0.183103 4.11843 0.060713 4.8 0.547562 4.8Z"
      />
      <path
        className={downClassName}
        d="M6.65244 6.80005H0.547561C0.0607123 6.80005 -0.183102 7.48162 0.161151 7.88024L3.21359 11.4147C3.427 11.6618 3.773 11.6618 3.98641 11.4147L7.03885 7.88024C7.3831 7.48162 7.13929 6.80005 6.65244 6.80005Z"
      />
    </g>
  </svg>
);
