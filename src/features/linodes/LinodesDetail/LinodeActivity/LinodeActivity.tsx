import * as React from 'react';
import { compose } from 'recompose';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import EventsLanding from 'src/features/Events/EventsLanding';
import { getEvents } from 'src/services/account';
import { withLinodeDetailContext } from '../linodeDetailContext';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = () => ({
  root: {}
});

interface Props {}
type CombinedProps = Props & WithStyles<ClassNames> & StateProps;

export const LinodeActivity: React.StatelessComponent<
  CombinedProps
> = props => {
  return (
    <EventsLanding
      title="Activity Feed"
      getEventsRequest={(params: any = {}) =>
        getEvents(params, {
          'entity.type': 'linode',
          'entity.id': props.linodeID
        })
      }
      isEntitySpecific={true}
    />
  );
};

interface StateProps {
  linodeID: number;
}
const linodeContext = withLinodeDetailContext(({ linode }) => ({
  linodeID: linode.id
}));

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, Props>(
  linodeContext,
  styled
);

export default enhanced(LinodeActivity);
