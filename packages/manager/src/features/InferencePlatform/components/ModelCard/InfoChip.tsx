import { Tooltip } from '@akamai/cds-components/react/Tooltip';
import { Box, Typography } from '@linode/ui';
import React from 'react';

import styles from './InfoChip.module.css';

interface InfoChipProps {
  description?: string;
  key?: number | string;
  splitMetricRows?: boolean;
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
  splitMetricRows = false,
}: InfoChipProps) => {
  const titleNode = title ? (
    <Box
      className={styles.titleNode}
      component={splitMetricRows ? 'div' : 'span'}
      sx={(theme) => ({ font: theme.font.normal })}
    >
      {title}
    </Box>
  ) : null;

  const valueNode = value ? (
    <Box
      className={type === 'metric' ? styles.metricValue : styles.useCaseValue}
      component="span"
      sx={(theme) => ({
        font: type === 'metric' ? theme.font.bold : theme.font.normal,
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
        className={styles.metricChip}
        sx={(theme) => ({ background: theme.palette.background.default })}
      >
        <Typography className={styles.metricChipText}>{content}</Typography>
      </Box>
    );
  }

  const chip = (
    <Box
      className={styles.useCaseChip}
      sx={(theme) => ({ background: theme.palette.background.default })}
    >
      <Typography className={styles.useCaseChipText}>{content}</Typography>
    </Box>
  );

  if (description) {
    return <Tooltip tooltipText={description}>{chip}</Tooltip>;
  }

  return chip;
};

export { InfoChip };
export type { InfoChipProps };
