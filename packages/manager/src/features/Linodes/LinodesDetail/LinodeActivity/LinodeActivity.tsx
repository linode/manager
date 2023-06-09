import * as React from 'react';
import { compose } from 'recompose';
import EventsLanding from 'src/features/Events/EventsLanding';
import { withLinodeDetailContext } from '../linodeDetailContext';

type CombinedProps = StateProps;

export const LinodeActivity: React.FC<CombinedProps> = (props) => {
  const { linodeID } = props;

  return (
    <EventsLanding
      entityId={linodeID}
      filter={{
        'entity.type': 'linode',
        'entity.id': props.linodeID,
      }}
      errorMessage="There was an error retrieving activity for this Linode."
      emptyMessage="No recent activity for this Linode."
      data-qa-events-landing-for-linode
    />
  );
};

interface StateProps {
  linodeID: number;
}
const linodeContext = withLinodeDetailContext(({ linode }) => ({
  linodeID: linode.id,
}));

const enhanced = compose<CombinedProps, {}>(linodeContext);

export default enhanced(LinodeActivity);
