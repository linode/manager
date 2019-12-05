import { Event } from 'linode-js-sdk/lib/account';
import * as React from 'react';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import Grid from 'src/components/Grid';
import eventMessageGenerator from 'src/eventMessageGenerator';
import { formatEventWithUsername } from 'src/features/Events/Event.helpers';

type ClassNames = 'root';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(1),
      borderBottom: `1px solid ${theme.palette.divider}`,
      width: '100%',
      margin: 0
    }
  });

interface Props {
  event: Event;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const ActivityRow: React.StatelessComponent<CombinedProps> = props => {
  const { classes, event } = props;

  const message = eventMessageGenerator(event);

  if (!message) {
    return null;
  }

  const displayedMessage = formatEventWithUsername(
    event.action,
    event.username,
    message,
    event.duration
  );

  /*
    gets the capturing groups for duration and the rest of the message
  */
  const durationText = /^(\(took.*\))(.*)$/gim.exec(displayedMessage);

  // @ts-ignore
  const [_, timeTaken, restOfMessage] = durationText || [];

  return (
    <Grid
      className={classes.root}
      container
      direction={'row'}
      justify={'space-between'}
      alignItems={'center'}
      data-qa-activity-row
    >
      <Grid item>
        <Typography>
          {durationText ? (
            <React.Fragment>
              <strong>{timeTaken}</strong>
              {` ${restOfMessage}`}
            </React.Fragment>
          ) : (
            displayedMessage
          )}
        </Typography>
      </Grid>
      <Grid item>
        <DateTimeDisplay value={event.created} humanizeCutoff={'month'} />
      </Grid>
    </Grid>
  );
};

const styled = withStyles(styles);

export default styled(ActivityRow);
