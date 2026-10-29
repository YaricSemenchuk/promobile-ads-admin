// Glyphs the platform icon set has no equivalent for, drawn on the same 16px grid
// with the same 1.5px round stroke, coloured through --stroke-0 like the rest.
import type { SVGProps } from "react";

export const UsersIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} width="100%" height="100%" overflow="visible" style={{ display: "block" }} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="5" r="2.75" stroke="var(--stroke-0, #12B76A)" strokeWidth="1.5" />
    <path d="M2.75 14.25C2.75 11.6266 5.10051 9.5 8 9.5C10.8995 9.5 13.25 11.6266 13.25 14.25" stroke="var(--stroke-0, #12B76A)" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const LogoutIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} width="100%" height="100%" overflow="visible" style={{ display: "block" }} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 14.25H3.75C2.92157 14.25 2.25 13.5784 2.25 12.75V3.25C2.25 2.42157 2.92157 1.75 3.75 1.75H6M10.5 11.25L13.75 8L10.5 4.75M13.5 8H6.25" stroke="var(--stroke-0, #9698A3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
