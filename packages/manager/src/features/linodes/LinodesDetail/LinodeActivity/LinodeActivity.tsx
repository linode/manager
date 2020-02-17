import * as React from 'react';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import EventsLanding from 'src/features/Events/EventsLanding';
import { compose } from 'src/utilities/compose';
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

export const LinodeActivity: React.StatelessComponent<CombinedProps> = props => {
  const { classes, linodeID } = props;

  return (
    <div id="tabpanel-activity" role="tabpanel" aria-labelledby="tab-activity">
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
