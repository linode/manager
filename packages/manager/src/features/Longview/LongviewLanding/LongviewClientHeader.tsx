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
import { pluralize } from 'src/utilities/pluralize';
import { LongviewPackage } from '../request.types';

interface Props {
  clientID: number;
  clientLabel: string;
}

type CombinedProps = Props & DispatchProps & LVDataProps;

const getPackageNoticeText = (packages: LongviewPackage[]) => {
  if (!packages) {
    return 'Package information not available';
  }
  if (packages.length === 0) {
    return 'All packages up to date';
  }
  return `${pluralize('package', 'packages', packages.length)} have updates`;
};

export const LongviewClientHeader: React.FC<CombinedProps> = props => {
  const {
    clientID,
    clientLabel,
    longviewClientData,
    longviewClientDataLoading,
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

  const hostname = pathOr(
    'Hostname not available',
    ['SysInfo', 'hostname'],
    longviewClientData
  );
  const uptime = pathOr<number | null>(0, ['Uptime'], longviewClientData);
  const formattedUptime = uptime
    ? `Up ${formatUptime(uptime)}`
    : 'Uptime not available';
  const packages = pathOr<LongviewPackage[] | null>(
    null,
    ['Packages'],
    longviewClientData
  );
  const packagesToUpdate = getPackageNoticeText(packages);

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
        {longviewClientDataLoading ? (
          <Typography>Loading...</Typography>
        ) : (
          <>
            <Typography>{formattedUptime}</Typography>
            <Typography>{packagesToUpdate}</Typography>
          </>
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
