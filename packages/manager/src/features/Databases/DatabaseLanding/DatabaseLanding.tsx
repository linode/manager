import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import EntityTable from 'src/components/EntityTable/EntityTable_CMR';
import LandingHeader from 'src/components/LandingHeader';
import DatabaseRow from './DatabaseRow';
// import { ActionHandlers as DatabaseHandlers } from './DatabaseActionMenu';

type CombinedProps = RouteComponentProps<{}>;

const DatabaseLanding: React.FC<CombinedProps> = props => {
  const headers = [
    {
      label: 'Label',
      dataColumn: 'description',
      sortable: true,
      widthPercent: 15
    },
    {
      label: 'Status',
      dataColumn: 'status',
      sortable: true,
      widthPercent: 10
    },
    {
      label: 'Region',
      dataColumn: 'region',
      sortable: true,
      widthPercent: 10
    },
    {
      label: 'Hostname',
      dataColumn: 'hostname',
      sortable: true,
      widthPercent: 15
    },
    {
      label: 'Port',
      dataColumn: 'port',
      sortable: true,
      widthPercent: 5
    },
    {
      label: 'Last Backup',
      dataColumn: 'backup',
      sortable: true,
      widthPercent: 10
    },
    {
      label: 'Tags',
      dataColumn: 'tags',
      sortable: false,
      widthPercent: 15
    },
    {
      label: 'Action Menu',
      visuallyHidden: true,
      dataColumn: '',
      sortable: false,
      widthPercent: 5
    }
  ];

  const _DatabaseRow = {
    Component: DatabaseRow,
    data: [],
    loading: false,
    lastUpdated: 1234,
    error: undefined
  };

  return (
    <React.Fragment>
      <LandingHeader
        title="Databases"
        entity="Database"
        iconType="linode"
        docsLink="http://google.com"
        headerOnly
      />
      <EntityTable
        entity="databases"
        groupByTag={false}
        row={_DatabaseRow}
        headers={headers}
        initialOrder={{ order: 'asc', orderBy: 'label' }}
      />
      {/* <DatabaseDialog
        open={modalOpen}
        deleteVlan={deleteDatabase}
        selectedVlanID={selectedDatabaseID}
        selectedVlanLabel={selectedDatabaseLabel}
        closeDialog={() => toggleModal(false)}
      /> */}
    </React.Fragment>
  );
};

export default compose<CombinedProps, {}>(React.memo)(DatabaseLanding);
