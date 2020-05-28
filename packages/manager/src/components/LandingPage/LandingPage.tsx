import * as React from 'react';

import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import TableContentWrapper from 'src/components/TableContentWrapper';
import LandingHeader, { HeaderProps } from './LandingHeader';

const useStyles = makeStyles((theme: Theme) => ({}));

interface Props {
  groupByTag: boolean;
}

export type CombinedProps = Props & HeaderProps;

export const LandingPage: React.FC<CombinedProps> = props => {
  const { groupByTag, ...headerProps } = props;
  return (
    <Paper>
      <LandingHeader {...headerProps} />
    </Paper>
  );
};

export default LandingPage;
