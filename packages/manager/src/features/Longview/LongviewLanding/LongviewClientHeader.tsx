import { pathOr } from 'ramda';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';
import Typography from 'src/components/core/Typography';
import EditableEntityLabel from 'src/components/EditableEntityLabel';
import Grid from 'src/components/Grid';
import withLongviewClients, {
  DispatchProps
} from 'src/containers/longview.container';
import withClientStats, {
  Props as LVDataProps
} from 'src/containers/longview.stats.container';
import { formatUptime } from 'src/utilities/formatUptime';
import { LongviewPackage } from '../request.types';

interface Props {
  clientID: number;
  clientLabel: string;
}

type CombinedProps = Props & DispatchProps & LVDataProps;

export const LongviewClientHeader: React.FC<CombinedProps> = props => {
  const {
    clientID,
    clientLabel,
    longviewClientData,
    longviewClientDataLoading,
    longviewClientDataError,
    updateLongviewClient
  } = props;
  const [updating, setUpdating] = React.useState<boolean>(false);

  const handleUpdateLabel = (newLabel: string) => {
    setUpdating(true);
    return updateLongviewClient(clientID, newLabel)
      .then(_ => {
        setUpdating(false);
      })
      .catch(_ => setUpdating(false));
  };

  const hostname = pathOr('', ['SysInfo', 'hostname'], longviewClientData);
  const uptime = pathOr<number | null>(0, ['Uptime'], longviewClientData);
  const formattedUptime = uptime ? formatUptime(uptime) : null;
  const packages = pathOr<LongviewPackage[] | null>(
    null,
    ['Packages'],
    longviewClientData
  );
  const packagesToUpdate = packages ? packages.length : null;

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
          subText={hostname}
          status="running"
          onEdit={handleUpdateLabel}
          loading={updating}
        />
      </Grid>
      <Grid item>
        {formattedUptime && <Typography>{`Up ${formattedUptime}`}</Typography>}
        {packagesToUpdate && (
          <Typography>{packagesToUpdate} packages have updates</Typography>
        )}
      </Grid>
      <Grid item>
        <Link to={`/longview/clients/${clientID}`}>View details</Link>
      </Grid>
    </Grid>
  );
};

const enhanced = compose<CombinedProps, Props>(
  withClientStats((ownProps: Props) => ownProps.clientID),
  /** We only need the update action here, easier than prop drilling through 4 components */
  withLongviewClients(() => ({}))
);

export default enhanced(LongviewClientHeader);
