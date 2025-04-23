import { Typography } from '@linode/ui';
import Grid from '@mui/material/Grid2';
import * as React from 'react';

import {
  StyledHeaderGrid,
  StyledRootGrid,
  StyledTypography,
} from './DashboardCard.styles';

interface DashboardCardProps {
  alignHeader?: 'flex-start' | 'space-between';
  alignItems?: 'center' | 'flex-start';
  children?: React.ReactNode;
  className?: string;
  headerAction?: () => JSX.Element | JSX.Element[] | null;
  noHeaderActionStyles?: boolean;
  title?: string;
}

const DashboardCard = (props: DashboardCardProps) => {
  const {
    alignHeader,
    alignItems,
    headerAction,
    noHeaderActionStyles,
    title,
  } = props;

  const ConditionalTypography = !noHeaderActionStyles
    ? StyledTypography
    : Typography;

  return (
    <StyledRootGrid container data-qa-card={title} spacing={2}>
      {(title || headerAction) && (
        <Grid size={12}>
          <StyledHeaderGrid
            alignItems={alignItems || 'flex-start'}
            container
            justifyContent={alignHeader || 'space-between'}
            spacing={2}
          >
            {title && (
              <Grid className={'p0'}>
                <Typography variant="h2">{title}</Typography>
              </Grid>
            )}
            {headerAction && (
              <Grid className={'p0'}>
                <ConditionalTypography variant="body1">
                  {headerAction()}
                </ConditionalTypography>
              </Grid>
            )}
          </StyledHeaderGrid>
        </Grid>
      )}
      <Grid size={12}>{props.children}</Grid>
    </StyledRootGrid>
  );
};

export default DashboardCard;
