import { Tooltip } from '@linode/ui';
import React from 'react';

interface TruncatedWithTooltipProps {
  maxLength?: number;
  text: string;
}

const truncateEnd = (maxLength: number, text: string): string =>
  text.length <= maxLength ? text : `${text.slice(0, maxLength)}…`;

export const TruncatedWithTooltip = ({
  maxLength = 50,
  text,
}: TruncatedWithTooltipProps) => {
  if (text.length > maxLength) {
    const truncated = truncateEnd(maxLength, text);

    return (
      <Tooltip title={text}>
        <span>{truncated}</span>
      </Tooltip>
    );
  }

  return text;
};
