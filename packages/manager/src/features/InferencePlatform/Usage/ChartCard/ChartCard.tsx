import { Tooltip } from '@akamai/cds-components/react/Tooltip';
import { HelpCircleOutline } from '@akamai/cds-icons/react';
import { Paper, Stack, Typography } from '@linode/ui';
import React from 'react';

export interface ChartCardProps {
  children: React.ReactNode;
  padding?: number | string;
  title: string;
  tooltipText?: string;
}

export const ChartCard = ({
  children,
  padding,
  title,
  tooltipText,
}: ChartCardProps) => (
  <Paper sx={{ borderWidth: 0, p: padding ?? 2 }} variant="outlined">
    <Stack
      alignItems="center"
      direction="row"
      gap={0.5}
      padding={0}
      sx={{ mb: 1 }}
    >
      <Typography sx={(theme) => ({ font: theme.font.bold })} variant="h3">
        {title}
      </Typography>

      {tooltipText && (
        <Tooltip tooltipPlacement="right" tooltipText={tooltipText}>
          <span
            style={{
              alignItems: 'center',
              cursor: 'help',
              display: 'flex',
            }}
          >
            <HelpCircleOutline height={15} width={15} />
          </span>
        </Tooltip>
      )}
    </Stack>
    {children}
  </Paper>
);
