import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';

import withLongviewClients, {
  DispatchProps,
  Props as LVProps
} from 'src/containers/longview.container';

interface Props {
  clients: LVProps['longviewClientsData'];
}

type CombinedProps = RouteComponentProps<{ id: string }> &
  Props &
  DispatchProps;

const LongviewDetail: React.FC<CombinedProps> = props => {
  const {
    match: {
      params: { id }
    },
    clients
  } = props;

  React.useEffect(() => {
    /** request clients if they haven't already been requested */
    if (!Object.keys(clients).length) {
      props.getLongviewClients();
    }
  }, []);

  const client = clients[id];

  return <div>hello {client ? client.label : 'loading...'}</div>;
};

export default compose<CombinedProps, {}>(
  React.memo,
  withLongviewClients<Props, {}>((own, { longviewClientsData }) => ({
    clients: longviewClientsData
  }))
)(LongviewDetail);
