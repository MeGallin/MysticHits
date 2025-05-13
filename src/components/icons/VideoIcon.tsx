import React from 'react';

interface VideoIconProps {
  className?: string;
  size?: number;
}

export const VideoIcon: React.FC<VideoIconProps> = ({
  className = '',
  size = 14,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z" />
      <path d="m10 15 5-3-5-3Z" />
    </svg>
  );
};

export default VideoIcon;
