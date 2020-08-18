import * as React from 'react';
import { compose } from 'recompose';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import EventsLanding from 'src/features/Events/EventsLanding';
import { getEventsForEntity } from 'src/utilities/getEventsForEntity';
import { withLinodeDetailContext } from '../linodeDetailContext';

type ClassNames = 'root' | 'title';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    title: {
      marginBottom: theme.spacing(2)
    }
  });

type CombinedProps = WithStyles<ClassNames> & StateProps;

export const LinodeActivity: React.FC<CombinedProps> = props => {
  const { classes, linodeID } = props;

  return (
    <div>
      <Typography
        variant="h2"
        className={classes.title}
        data-qa-settings-header
      >
        Activity Feed
      </Typography>
      <EventsLanding
        entityId={linodeID}
        getEventsRequest={(params: any = {}) =>
          getEventsForEntity(params, 'linode', props.linodeID)
        }
        errorMessage="There was an error retrieving activity for this Linode."
        emptyMessage="No recent activity for this Linode."
        data-qa-events-landing-for-linode
      />
    </div>
  );
};

interface StateProps {
  linodeID: number;
}
const linodeContext = withLinodeDetailContext(({ linode }) => ({
  linodeID: linode.id
}));

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, {}>(linodeContext, styled);

export default enhanced(LinodeActivity);
