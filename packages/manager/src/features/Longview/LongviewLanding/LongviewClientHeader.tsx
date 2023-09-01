import { APIError } from '@linode/api-v4/lib/types';
import { pathOr } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';

import { EditableEntityLabel } from 'src/components/EditableEntityLabel/EditableEntityLabel';
import { Grid } from 'src/components/Grid';
import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';
import { DispatchProps } from 'src/containers/longview.container';
import withClientStats, {
  Props as LVDataProps,
} from 'src/containers/longview.stats.container';
import { useProfile } from 'src/queries/profile';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { formatDate } from 'src/utilities/formatDate';
import { formatUptime } from 'src/utilities/formatUptime';

import { LongviewPackage } from '../request.types';
import { getPackageNoticeText } from '../shared/utilities';
import {
  StyledButton,
  StyledDiv,
  StyledRootGrid,
  StyledUpdatesGrid,
} from './LongviewClientHeader.styles';
import { RestrictedUserLabel } from './RestrictedUserLabel';

interface Props {
  clientID: number;
  clientLabel: string;
  lastUpdatedError?: APIError[];
  longviewClientLastUpdated?: number;
  openPackageDrawer: () => void;
  updateLongviewClient: DispatchProps['updateLongviewClient'];
  userCanModifyClient: boolean;
}

type CombinedProps = Props & DispatchProps & LVDataProps;

const enhanced = compose<CombinedProps, Props>(
  withClientStats((ownProps: Props) => ownProps.clientID)
);

export const LongviewClientHeader = enhanced((props: CombinedProps) => {
  const {
    clientID,
    clientLabel,
    lastUpdatedError,
    longviewClientData,
    longviewClientDataLoading,
    longviewClientLastUpdated,
    openPackageDrawer,
    updateLongviewClient,
    userCanModifyClient,
  } = props;

  const [updating, setUpdating] = React.useState<boolean>(false);

  const { data: profile } = useProfile();

  const handleUpdateLabel = (newLabel: string) => {
    setUpdating(true);
    return updateLongviewClient(clientID, newLabel)
      .then((_) => {
        setUpdating(false);
      })
      .catch((error) => {
        setUpdating(false);
        return Promise.reject(
          getAPIErrorOrDefault(error, 'Error updating label')[0].reason
        );
      });
  };

  const hostname = pathOr(
    'Hostname not available',
    ['SysInfo', 'hostname'],
    longviewClientData
  );
  const uptime = pathOr<null | number>(null, ['Uptime'], longviewClientData);
  const formattedUptime =
    uptime !== null ? `Up ${formatUptime(uptime)}` : 'Uptime not available';
  const packages = pathOr<LongviewPackage[] | null>(
    null,
    ['Packages'],
    longviewClientData
  );
  const numPackagesToUpdate = packages ? packages.length : 0;
  const packagesToUpdate = getPackageNoticeText(packages);

  const formattedlastUpdatedTime =
    longviewClientLastUpdated !== undefined
      ? `Last updated ${formatDate(longviewClientLastUpdated, {
          timezone: profile?.timezone,
        })}`
      : 'Latest update time not available';

  /**
   * The pathOrs ahead will default to 'not available' values if
   * there's an error, so the only case we need to handle is
   * the loading state, which should be displayed only if
   * data is loading for the first time and there are no errors.
   */
  const loading =
    longviewClientDataLoading &&
    !lastUpdatedError &&
    longviewClientLastUpdated !== 0;

  return (
    <StyledRootGrid spacing={2}>
      <Grid item>
        {userCanModifyClient ? (
          <EditableEntityLabel
            loading={updating}
            onEdit={handleUpdateLabel}
            subText={hostname}
            text={clientLabel}
          />
        ) : (
          <RestrictedUserLabel label={clientLabel} subtext={hostname} />
        )}
      </Grid>
      <StyledUpdatesGrid>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <>
            <Typography>{formattedUptime}</Typography>
            {numPackagesToUpdate > 0 ? (
              <StyledButton
                onClick={() => openPackageDrawer()}
                title={packagesToUpdate}
              >
                {packagesToUpdate}
              </StyledButton>
            ) : (
              <Typography>{packagesToUpdate}</Typography>
            )}
          </>
        )}
      </StyledUpdatesGrid>
      <Grid item>
        <Link to={`/longview/clients/${clientID}`}>View Details</Link>
        {!loading && (
          <StyledDiv>
            <Typography sx={{ fontSize: '0.75rem' }} variant="caption">
              {formattedlastUpdatedTime}
            </Typography>
          </StyledDiv>
        )}
      </Grid>
    </StyledRootGrid>
  );
});
