import * as React from 'react';
import Grid from 'src/components/core/Grid';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ViewAllLink from 'src/components/ViewAllLink';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import { getEventsForEntity } from 'src/utilities/getEventsForEntity';
import ActivitySummaryContent from './ActivitySummaryContent';

type ClassNames = 'root' | 'header' | 'viewMore';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    marginBottom: theme.spacing.unit * 4
  },
  header: {
    marginBottom: theme.spacing.unit * 2
  },
  viewMore: {
    position: 'relative',
    top: 2
  }
});

interface Props {
  linodeId: number;
}

interface State {
  loading: boolean;
  error?: string;
  events: Linode.Event[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

export class ActivitySummary extends React.Component<CombinedProps, State> {
  state: State = {
    loading: true,
    error: undefined,
    events: []
  };

  componentDidMount() {
    getEventsForEntity({}, 'linode', this.props.linodeId)
      .then(response => {
        this.setState({
          events: response.data.slice(0, 5),
          loading: false
        });
      })
      .catch(err => {
        this.setState({
          error: getErrorStringOrDefault(
            err,
            "Couldn't retrieve events for this Linode."
          ),
          loading: false
        });
      });
  }
  render() {
    const { classes, linodeId } = this.props;
    const { events, error, loading } = this.state;
    return (
      <>
        <Grid container alignItems={'center'} className={classes.header}>
          <Grid item>
            <Typography variant="h2">Activity Feed</Typography>
          </Grid>
          <Grid item>
            <Typography>
              <ViewAllLink
                text="View More Activity"
                link={`/linodes/${linodeId}/activity`}
                className={classes.viewMore}
              />
            </Typography>
          </Grid>
        </Grid>
        <Paper className={classes.root}>
          <ActivitySummaryContent
            events={events}
            error={error}
            loading={loading}
          />
        </Paper>
      </>
    );
  }
}

const styled = withStyles(styles);

export default styled(ActivitySummary);
