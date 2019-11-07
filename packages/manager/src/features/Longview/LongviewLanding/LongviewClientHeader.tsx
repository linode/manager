import * as React from 'react';
import { Link } from 'react-router-dom';

import Typography from 'src/components/core/Typography';
import EditableEntityLabel from 'src/components/EditableEntityLabel';
import Grid from 'src/components/Grid';

import withLongviewClients, {
  DispatchProps
} from 'src/containers/longview.container';

interface Props {
  clientID: number;
  clientLabel: string;
}

type CombinedProps = Props & DispatchProps;

export const LongviewClientHeader: React.FC<CombinedProps> = props => {
  const { clientID, clientLabel, updateLongviewClient } = props;
  const [updating, setUpdating] = React.useState<boolean>(false);

  const handleUpdateLabel = (newLabel: string) => {
    setUpdating(true);
    return updateLongviewClient(clientID, newLabel);
  };

  return (
    <Grid
      container
      item
      direction="column"
      spacing={2}
      style={{ paddingTop: '16px', paddingLeft: '16px' }}
    >
      <Grid
        container
        item
        direction="row"
        justify="flex-start"
        alignItems="center"
      >
        <EditableEntityLabel
          text={clientLabel}
          iconVariant="linode"
          subText="dev.hostname.com"
          status="running"
          onEdit={handleUpdateLabel}
          loading={updating}
        />
      </Grid>
      <Grid item>
        <Typography>Up 47d 19h 22m</Typography>
        <Typography>2 packages have updates</Typography>
      </Grid>
      <Grid item>
        <Link to={`/longview/clients/${clientID}`}>View details</Link>
      </Grid>
    </Grid>
  );
};

/** We only need the update action here, easier than prop drilling through 4 components */
export default withLongviewClients(() => ({}))(LongviewClientHeader);
