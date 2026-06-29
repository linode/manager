import { useTheme } from '@mui/material/styles';
import React from 'react';

interface UsageSparklineProps {
  data: number[];
  width?: number;
}

export const UsageSparkline = ({ data, width = 100 }: UsageSparklineProps) => {
  const theme = useTheme();
  const height = 24;

  // If data is empty, create a flat line at zero
  const displayData = data.length > 0 ? data : [0, 0];
  const max = Math.max(...displayData, 1);

  const points = displayData
    .map((value, index) => {
      const x = (index / (displayData.length - 1)) * width;
      const y = height - (value / max) * height;
      return `${x},${y}`;
    })
    .join(' ');

  // Create area path by closing the polyline at the bottom
  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg height={height} width={width}>
      <polygon
        fill={theme.tokens.color.Ultramarine[70]}
        opacity={0.15}
        points={areaPoints}
      />
      <polyline
        fill="none"
        points={points}
        stroke={theme.tokens.color.Ultramarine[70]}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </svg>
  );
};
