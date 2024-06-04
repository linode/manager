import { styled } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import React from 'react';

import { Box } from 'src/components/Box';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';

interface DistributedRegionPlanTableProps {
  copy?: string;
  docsLink?: JSX.Element;
  error?: JSX.Element | string;
  header: string;
  innerClass?: string;
  renderTable: () => React.JSX.Element;
  rootClass?: string;
  sx?: SxProps;
}

export const DistributedRegionPlanTable = React.memo(
  (props: DistributedRegionPlanTableProps) => {
    const {
      copy,
      docsLink,
      error,
      header,
      innerClass,
      renderTable,
      rootClass,
      sx,
    } = props;

    return (
      <Paper
        className={rootClass}
        data-qa-tp={header}
        sx={{ flexGrow: 1, ...sx }}
      >
        <div className={innerClass}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            {header && (
              <Typography data-qa-tp-title variant="h2">
                {header}
              </Typography>
            )}
            {docsLink}
          </Box>
          {error && (
            <Notice spacingBottom={0} spacingTop={12} variant="error">
              {error}
            </Notice>
          )}
          {copy && <StyledTypography data-qa-tp-copy>{copy}</StyledTypography>}
          {renderTable()}
        </div>
      </Paper>
    );
  }
);

const StyledTypography = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  marginTop: theme.spacing(1),
}));
