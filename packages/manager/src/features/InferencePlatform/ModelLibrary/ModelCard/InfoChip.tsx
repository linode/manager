import { Box, Tooltip, Typography } from '@linode/ui';
import React from 'react';

interface InfoChipProps {
  description?: string;
  key?: number | string;
  title?: string;
  titlePosition?: 'after' | 'before';
  type: 'metric' | 'useCase';
  value: string;
}

const InfoChip = ({
  description,
  title,
  titlePosition = 'before',
  type,
  value,
}: InfoChipProps) => {
  const titleNode = title ? (
    <Box
      component="span"
      sx={(theme) => ({
        font: theme.font.normal,
        fontSize: 12,
        paddingLeft: 0.2,
      })}
    >
      {title}
    </Box>
  ) : null;

  const valueNode = value ? (
    <Box
      component="span"
      sx={(theme) => ({
        ...(type === 'metric'
          ? { font: theme.font.bold }
          : { font: theme.font.normal }),
        ...(type === 'metric' ? { fontSize: 14 } : { fontSize: 11 }),
      })}
    >
      {value}
    </Box>
  ) : null;

  const content =
    titlePosition === 'before' ? (
      <>
        {titleNode}
        {title ? ' ' : ''}
        {valueNode}
      </>
    ) : (
      <>
        {valueNode}
        {title ? ' ' : ''}
        {titleNode}
      </>
    );

  if (type === 'metric') {
    return (
      <Box
        sx={(theme) => ({
          background: theme.palette.background.default,
          border: 0,
          borderRadius: 0.6,
          flex: 1,
          px: 2,
          py: 1,
        })}
      >
        <Typography sx={{ fontSize: 13 }}>{content}</Typography>
      </Box>
    );
  }

  const chip = (
    <Box
      sx={(theme) => ({
        alignItems: 'center',
        background: theme.palette.background.default,
        border: 0,
        borderRadius: 0.4,
        display: 'flex',
        flex: 1,
        height: 22,
        justifyContent: 'center',
        px: 1.2,
        whiteSpace: 'nowrap',
      })}
    >
      <Typography sx={{ fontSize: 11 }}>{content}</Typography>
    </Box>
  );

  if (description) {
    return <Tooltip title={description}>{chip}</Tooltip>;
  }

  return chip;
};

export { InfoChip };
export type { InfoChipProps };
