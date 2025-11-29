import React from "react";

const HeartIcon = ({ filled = false, size = 20 }) => {
  return filled ? (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="red"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 21s-6-4.35-9-8.25S-1 4.5 4.5 3 12 9 12 9s3.75-6 7.5-6 6.75 3 3 9.75S12 21 12 21z" />
    </svg>
  ) : (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="red"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20.8 4.6c-1.8-1.8-4.7-1.8-6.5 0L12 6.9l-2.3-2.3c-1.8-1.8-4.7-1.8-6.5 0s-1.8 4.7 0 6.5L12 21l8.8-8.8c1.7-1.8 1.7-4.7 0-6.5z" />
    </svg>
  );
};

export default HeartIcon;
