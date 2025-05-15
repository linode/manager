import { useProfile } from '@linode/queries';
import { Typography } from '@linode/ui';
import { formatUptime } from '@linode/utilities';
import Grid from '@mui/material/Grid';
import * as React from 'react';
import { compose } from 'recompose';

import { EditableEntityLabel } from 'src/components/EditableEntityLabel/EditableEntityLabel';
import { Link } from 'src/components/Link';
import withClientStats from 'src/containers/longview.stats.container';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { formatDate } from 'src/utilities/formatDate';

import { getPackageNoticeText } from '../shared/utilities';
import {
  StyledButton,
  StyledDiv,
  StyledRootGrid,
  StyledUpdatesGrid,
} from './LongviewClientHeader.styles';
import { RestrictedUserLabel } from './RestrictedUserLabel';

import type { APIError } from '@linode/api-v4/lib/types';
import type { DispatchProps } from 'src/containers/longview.container';
import type { Props as LVDataProps } from 'src/containers/longview.stats.container';

interface Props {
  clientID: number;
  clientLabel: string;
  lastUpdatedError?: APIError[];
  longviewClientLastUpdated?: number;
  openPackageDrawer: () => void;
  updateLongviewClient: DispatchProps['updateLongviewClient'];
  userCanModifyClient: boolean;
}

interface LongviewClientHeaderProps extends Props, DispatchProps, LVDataProps {}

const enhanced = compose<LongviewClientHeaderProps, Props>(
  withClientStats((ownProps: Props) => ownProps.clientID)
);

export const LongviewClientHeader = enhanced(
  (props: LongviewClientHeaderProps) => {
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

    const hostname =
      longviewClientData.SysInfo?.hostname ?? 'Hostname not available';
    const uptime = longviewClientData?.Uptime ?? null;
    const formattedUptime =
      uptime !== null ? `Up ${formatUptime(uptime)}` : 'Uptime not available';
    const packages = longviewClientData?.Packages ?? null;
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
      <StyledRootGrid container spacing={2}>
        <Grid>
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
        <Grid>
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
  }
);
