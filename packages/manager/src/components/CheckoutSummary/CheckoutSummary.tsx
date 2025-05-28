import { Paper, Typography } from '@linode/ui';
import { useTheme } from '@mui/material';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import * as React from 'react';

import { SummaryItem } from './SummaryItem';

import type { Theme } from '@mui/material/styles';

export interface CheckoutSummaryProps {
  /**
   * JSX element to be displayed as an agreement section.
   */
  agreement?: JSX.Element;
  /**
   * JSX element for additional content to be rendered within the component.
   */
  children?: JSX.Element | null;
  /**
   * The sections to be displayed in the `CheckoutSumamry`
   */
  displaySections: SummaryItem[];
  /**
   * The heading text to be displayed in the `CheckoutSummary`.
   */
  heading: string;
}

export interface SummaryItem {
  details?: number | string;
  hourly?: number;
  monthly?: number;
  title?: string;
}

export const CheckoutSummary = (props: CheckoutSummaryProps) => {
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
      <StyledSummary container direction={matchesSmDown ? 'column' : 'row'}>
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
      '&:first-child': {
        borderLeft: 'none',
        paddingLeft: 0,
      },
      borderLeft: `solid 1px ${theme.tokens.color.Neutrals[50]}`,
      padding: `0 ${theme.spacing(1.5)}`,
    },
  },
}));
