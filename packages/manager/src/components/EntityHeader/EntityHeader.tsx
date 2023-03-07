import * as React from 'react';
import Grid from '@mui/material/Grid';
import Typography, { TypographyProps } from 'src/components/core/Typography';
import { styled } from '@mui/material/styles';
import { isPropValid } from '../../utilities/isPropValid';

export interface HeaderProps {
  children?: React.ReactNode;
  headerOnly?: boolean;
  isSummaryView?: boolean;
  title: string | JSX.Element;
  variant?: TypographyProps['variant'];
}

type SummaryHeaderProps = Pick<HeaderProps, 'headerOnly'>;

const Wrapper = styled('div', {
  name: 'EntityHeader',
})(({ theme }) => ({
  alignItems: 'center',
  backgroundColor: theme.bg.bgPaper,
  display: 'flex',
  justifyContent: 'space-between',
  margin: 0,
  width: '100%',
  [theme.breakpoints.down('sm')]: {
    flexWrap: 'wrap',
  },
}));

const SummaryHeader = styled('div', {
  shouldForwardProp: (prop) => isPropValid(['headerOnly'], prop),
})<SummaryHeaderProps>(({ theme, ...props }) => ({
  alignItems: 'center',
  background: 'magenta',
  display: 'flex',
  ...(!props.headerOnly && {
    padding: theme.spacing(),
    whiteSpace: 'nowrap',
  }),
  ...(props.headerOnly && {
    [theme.breakpoints.up('sm')]: {
      flexBasis: '100%',
    },
  }),
}));

export const EntityHeader: React.FC<HeaderProps> = ({
  children,
  headerOnly,
  isSummaryView,
  title,
  variant = 'h2',
}) => {
  return (
    <Wrapper>
      {isSummaryView ? (
        <SummaryHeader headerOnly={headerOnly}>
          <Grid item>
            <Typography variant={variant}>{title}</Typography>
          </Grid>
        </SummaryHeader>
      ) : null}
      {children && (
        <Grid
          container
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          {children}
        </Grid>
      )}
    </Wrapper>
  );
};

export default EntityHeader;
