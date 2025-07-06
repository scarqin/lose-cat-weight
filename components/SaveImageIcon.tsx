import * as React from "react";

import { IconSvgProps } from "@/types";

export const SaveImageIcon: React.FC<IconSvgProps> = ({
  size = 24,
  width,
  height,
  ...props
}) => {
  return (
    <svg
      height={size || height}
      viewBox="0 0 24 24"
      width={size || width}
      {...props}
    >
      <path
        d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"
        fill="currentColor"
      />
      <path
        d="M14.14 12.86l-3 3a.49.49 0 01-.7 0l-3-3a.5.5 0 01.35-.85h1.79V8.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v3.51h1.79a.5.5 0 01.36.85z"
        fill="currentColor"
      />
    </svg>
  );
};
