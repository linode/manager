import Grid from '@mui/material/Unstable_Grid2';
// import { Theme } from '@mui/material/styles';
import * as React from 'react';
// import { makeStyles } from 'tss-react/mui';

import { Typography } from 'src/components/Typography';

import {
  StyledHeaderGrid,
  StyledRootGrid,
  StyledTypography,
} from './DashboardCard.styles';

// const useStyles = makeStyles()((theme: Theme) => ({
//   container: {
//     marginTop: theme.spacing(3),
//   },
//   header: {
//     padding: theme.spacing(3),
//     paddingBottom: 0,
//   },
//   headerAction: {
//     left: `-${theme.spacing(2)}`,
//     marginLeft: theme.spacing(0.5),
//     position: 'relative',
//     top: 6,
//   },
//   root: {
//     width: '100% !important',
//   },
// }));

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
        <Grid xs={12}>
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
      <Grid xs={12}>{props.children}</Grid>
    </StyledRootGrid>
  );
};

export default DashboardCard;
