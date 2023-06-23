import { styled, Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/styles';
import * as React from 'react';
import Paper from '../core/Paper';

import Typography from '../core/Typography';
import Grid from '../Grid';
import { SummaryItem } from './SummaryItem';

interface Props {
  heading: string;
  children?: JSX.Element | null;
  agreement?: JSX.Element;
  displaySections: SummaryItem[];
}

export interface SummaryItem {
  title?: string;
  details?: string | number;
  monthly?: number;
  hourly?: number;
}

export const CheckoutSummary = (props: Props) => {
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));

  const { agreement, children, displaySections, heading } = props;

  return (
    <StyledPaper data-qa-summary>
      <StyledHeading variant="h2" data-qa-order-summary>
        {heading}
      </StyledHeading>
      {displaySections.length === 0 ? (
        <StyledHeading variant="body1">
          Please configure your Linode.
        </StyledHeading>
      ) : null}
      <StyledSummary
        container
        spacing={3}
        direction={matchesSmDown ? 'column' : 'row'}
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
