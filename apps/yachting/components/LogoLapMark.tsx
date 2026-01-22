'use client';

import React from 'react';
import { cn } from '@36zero/ui';

interface LogoLapMarkProps {
  className?: string;
  size?: number;
}

export const LogoLapMark: React.FC<LogoLapMarkProps> = ({ className, size = 32 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 548 453"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
    >
      <path
        d="M548 271.753L530.708 310.414L483.335 416.775C473.466 438.746 454.279 452.512 433.434 452.512H203.06L326.626 175.574L348.575 126.258L394.593 23.1954C400.969 8.91906 413.413 0 426.962 0H488.17L435.27 118.716L413.477 167.558L406.609 182.929H406.687L367.131 271.753H548Z"
        fill="currentColor"
      />
      <path
        d="M344.94 0.000244141L221.374 276.939L199.424 326.253L153.481 429.295C147.109 443.584 134.658 452.513 121.103 452.513H59.8289L112.73 333.797L134.523 284.954L141.391 269.584H141.312L180.869 180.759H0L17.292 142.1L64.744 35.8324C74.5344 13.7666 93.7215 0.000244141 114.644 0.000244141H344.94Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default LogoLapMark;
