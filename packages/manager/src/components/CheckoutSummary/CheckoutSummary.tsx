import { Theme, styled } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material';
import * as React from 'react';

import { Grid } from '../Grid';
import { Paper } from '../Paper';
import { Typography } from '../Typography';
import { SummaryItem } from './SummaryItem';

interface Props {
  agreement?: JSX.Element;
  children?: JSX.Element | null;
  displaySections: SummaryItem[];
  heading: string;
}

export interface SummaryItem {
  details?: number | string;
  hourly?: number;
  monthly?: number;
  title?: string;
}

export const CheckoutSummary = (props: Props) => {
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));

  const { agreement, children, displaySections, heading } = props;

  return (
    <StyledPaper data-qa-summary>
      <StyledHeading data-qa-order-summary variant="h2">
        {heading}
      </StyledHeading>
      {displaySections.length === 0 ? (
        <StyledHeading variant="body1">
          Please configure your Linode.
        </StyledHeading>
      ) : null}
      <StyledSummary
        container
        direction={matchesSmDown ? 'column' : 'row'}
        spacing={3}
      >
        {displaySections.map((item) => (
          <SummaryItem key={`${item.title}-${item.details}`} {...item} />
        ))}
      </StyledSummary>
      {children}
      {agreement ? agreement : null}
    </StyledPaper>
  );
};

const StyledPaper = styled(Paper)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  marginTop: theme.spacing(3),
}));

const StyledHeading = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const StyledSummary = styled(Grid)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    '& > div': {
      '&:last-child': {
        borderRight: 'none',
      },
      borderRight: 'solid 1px #9DA4A6',
    },
  },
}));
