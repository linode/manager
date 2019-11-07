import * as React from 'react';
import { Link } from 'react-router-dom';

import Typography from 'src/components/core/Typography';
import EditableEntityLabel from 'src/components/EditableEntityLabel';
import Grid from 'src/components/Grid';

interface Props {
  clientID: number;
}

export const LongviewClientHeader: React.FC<Props> = props => {
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
          text={'Dev Server 1'}
          iconVariant="linode"
          subText="dev.hostname.com"
          status="running"
          onEdit={() => Promise.resolve(null)}
          loading={false}
        />
      </Grid>
      <Grid item>
        <Typography>Up 47d 19h 22m</Typography>
        <Typography>2 packages have updates</Typography>
      </Grid>
      <Grid item>
        <Link to={`/longview/clients/${props.clientID}`}>View details</Link>
      </Grid>
    </Grid>
  );
};

export default LongviewClientHeader;
