import { APIError } from 'linode-js-sdk/lib/types';
import { Volume } from 'linode-js-sdk/lib/volumes';
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
import VolumesContainer from 'src/containers/volumes.container';
import DashboardCard from '../DashboardCard';
import VolumeDashboardRow from './VolumeDashboardRow';

interface VolumeProps {
  volumesLoading: boolean;
  volumesError?: APIError[];
  volumesData: Volume[];
}

type CombinedProps = VolumeProps;

export const VolumesDashboardCard: React.FunctionComponent<
  CombinedProps
> = props => {
  const { volumesData, volumesLoading, volumesError } = props;

  const volumes = take(5, volumesData);

  const renderAction = () =>
    volumesData && volumesData.length > 5 ? (
      <ViewAllLink
        text="View All"
        link={'/volumes'}
        count={volumesData.length}
      />
    ) : null;

  const renderContent = () => {
    if (volumesLoading && volumesData.length === 0) {
      return renderLoading();
    }

    if (volumesError) {
      return renderErrors(volumesError);
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
    <TableRowError colSpan={3} message={`Unable to load Volumes.`} />
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

const withVolumes = VolumesContainer(
  (ownProps, volumesData, volumesLoading, volumesError) => {
    const mappedData = volumesData.items.map(id => ({
      ...volumesData.itemsById[id]
    }));
    return {
      ...ownProps,
      volumesData: mappedData,
      volumesLoading,
      volumesError
    };
  }
);

const enhanced = compose<CombinedProps, {}>(withVolumes);

export default enhanced(VolumesDashboardCard);
