import { APIError } from 'linode-js-sdk/lib/types';
import { take } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import Paper from 'src/components/core/Paper';
import Table from 'src/components/core/Table';
import TableBody from 'src/components/core/TableBody';

import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import ViewAllLink from 'src/components/ViewAllLink';
import withVolumes, {
  StateProps as VolumesProps
} from 'src/containers/volumes.container';
import withVolumesRequests, {
  VolumesRequests
} from 'src/containers/volumesRequests.container';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import DashboardCard from '../DashboardCard';
import VolumeDashboardRow from './VolumeDashboardRow';

type CombinedProps = VolumesProps & VolumesRequests;

export const VolumesDashboardCard: React.FunctionComponent<CombinedProps> = props => {
  const {
    getVolumesPage,
    volumesData,
    volumesLastUpdated,
    volumesLoading,
    volumesError,
    volumesResults
  } = props;

  const [error, setError] = React.useState<APIError[] | undefined>(undefined);

  React.useEffect(() => {
    if (volumesLastUpdated === 0 && !volumesLoading) {
      getVolumesPage({ params: { page_size: 25, page: 1 } }).catch(setError);
    }
  }, []);

  const volumes = take(5, volumesData);

  const _combinedErrors = volumesError?.read || error;

  const renderAction = () =>
    volumesResults > 5 ? (
      <ViewAllLink text="View All" link={'/volumes'} count={volumesResults} />
    ) : null;

  const renderContent = () => {
    if (volumesLoading && volumesData.length === 0) {
      return renderLoading();
    }

    if (_combinedErrors) {
      return renderErrors(_combinedErrors);
    }

    if (volumesData && volumesData.length > 0) {
      return volumes.map((volume, idx) => (
        <VolumeDashboardRow
          key={`volume-dashboard-row-${idx}`}
          volume={volume}
        />
      ));
    }

    return renderEmpty();
  };

  const renderLoading = () => {
    return <TableRowLoading colSpan={3} />;
  };

  const renderErrors = (errors: APIError[]) => (
    <TableRowError
      colSpan={3}
      message={
        getAPIErrorOrDefault(errors, `Unable to load Volumes.`)[0].reason
      }
    />
  );

  const renderEmpty = () => <TableRowEmptyState colSpan={2} />;

  return (
    <DashboardCard
      title="Volumes"
      headerAction={renderAction}
      alignHeader="flex-start"
      data-qa-dash-volume
    >
      <Paper>
        <Table>
          <TableBody>{renderContent()}</TableBody>
        </Table>
      </Paper>
    </DashboardCard>
  );
};

const enhanced = compose<CombinedProps, {}>(withVolumes(), withVolumesRequests);

export default enhanced(VolumesDashboardCard);
