import { styled } from '@mui/material/styles';
import * as React from 'react';

import { Typography } from 'src/components/Typography';

import type { SxProps } from '@mui/material/styles';
import type { TypographyProps } from 'src/components/Typography';

export interface DescriptionListProps {
  items: {
    description: string;
    title: string;
  }[];
  layout?: 'grid' | 'stacked';
  sx?: SxProps;
}

export const DescriptionList = (props: DescriptionListProps) => {
  const { items, layout = 'stacked', sx } = props;

  return (
    <StyledDL component="dl" layout={layout} sx={sx}>
      {items.map((item, idx) => {
        const { description, title } = item;

        return (
          <React.Fragment key={idx}>
            <StyledDLItemSeparator>
              <StyledDT component="dt">{title}</StyledDT>
              <StyledDD component="dd">{description}</StyledDD>
            </StyledDLItemSeparator>
          </React.Fragment>
        );
      })}
    </StyledDL>
  );
};

interface StyledDLProps extends TypographyProps {
  layout?: DescriptionListProps['layout'];
}

const StyledDL = styled(Typography, {
  label: 'StyledDL',
})<StyledDLProps>(({ theme, ...props }) => ({
  '& dt, & dd': {
    fontSize: '0.9rem',
    marginBottom: theme.spacing(),
  },
  display: 'flex',
  flexDirection: props.layout === 'grid' ? 'row' : 'column',
  flexWrap: 'wrap',
}));

const StyledDLItemSeparator = styled('div', {
  label: 'StyledDLItemSeparator',
})(() => ({
  display: 'flex',
}));

const StyledDT = styled(Typography, {
  label: 'StyledDT',
})<TypographyProps>(({ theme }) => ({
  float: 'left',
  fontFamily: theme.font.bold,
  marginRight: theme.spacing(0.75),
  whiteSpace: 'nowrap',
}));

const StyledDD = styled(Typography, {
  label: 'StyledDD',
})<TypographyProps>(({ theme }) => ({
  marginRight: theme.spacing(2),
}));
