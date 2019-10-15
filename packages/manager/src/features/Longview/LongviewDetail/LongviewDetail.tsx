import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';

import withLongviewClients, {
  DispatchProps,
  Props as LVProps
} from 'src/containers/longview.container';

interface Props {
  clients: LVProps['longviewClientsData'];
  longviewClientsLastUpdated: number;
}

type CombinedProps = RouteComponentProps<{ id: string }> &
  Props &
  DispatchProps;

const LongviewDetail: React.FC<CombinedProps> = props => {
  const {
    match: {
      params: { id }
    },
    clients,
    longviewClientsLastUpdated
  } = props;

  React.useEffect(() => {
    /** request clients if they haven't already been requested */
    if (longviewClientsLastUpdated === 0) {
      props.getLongviewClients();
    }
  }, []);

  const client = clients[id];

  return <div>hello {client ? client.label : 'loading...'}</div>;
};

export default compose<CombinedProps, {}>(
  React.memo,
  withLongviewClients<Props, {}>(
    (own, { longviewClientsData, longviewClientsLastUpdated }) => ({
      clients: longviewClientsData,
      longviewClientsLastUpdated
    })
  )
)(LongviewDetail);
