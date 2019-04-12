import * as React from 'react';

import {
  StyleRulesCallback,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import Grid from 'src/components/Grid';
import eventMessageGenerator from 'src/eventMessageGenerator';
import { onUnfound } from 'src/features/Events/EventRow';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    padding: theme.spacing.unit * 1.5,
    borderBottom: `1px solid ${theme.palette.divider}`
  }
});

interface Props {
  event: Linode.Event;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const ActivityRow: React.StatelessComponent<CombinedProps> = props => {
  const { classes, event } = props;

  const message = eventMessageGenerator(event, onUnfound);

  if (!message) {
    return null;
  }

  return (
    <Grid
      className={classes.root}
      container
      direction={'row'}
      justify={'space-between'}
      alignItems={'center'}
    >
      <Grid item>
        <Typography variant={'inherit'}>{message}</Typography>
      </Grid>
      <Grid item>
        <DateTimeDisplay value={event.created} humanizeCutoff={'month'} />
      </Grid>
    </Grid>
  );
};

const styled = withStyles(styles);

export default styled(ActivityRow);
