import React from "react";

const CallIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M6.62 10.79a15.464 15.464 0 006.59 6.59l2.2-2.2c.27-.27.66-.36 1-.24a11.72 11.72 0 003.68.59c.55 0 1 .45 1 1V21a1 1 0 01-1 1C10.74 22 2 13.26 2 2a1 1 0 011-1h3.47c.55 0 1 .45 1 1 0 1.27.2 2.52.59 3.68.11.34.03.73-.25 1l-2.19 2.11z" />
  </svg>
);

export default CallIcon;
