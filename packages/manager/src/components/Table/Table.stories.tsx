import { Config } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import { Provider } from 'react-redux';
import cachedTypes from 'src/cachedData/types.json';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import OrderBy from 'src/components/OrderBy';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import { linodeFactory } from 'src/factories/linodes';
import LinodeRow from 'src/features/linodes/LinodesLanding/LinodeRow';
import SortableTableHead from 'src/features/linodes/LinodesLanding/SortableTableHead';
import { Action } from 'src/features/linodes/PowerActionsDialogOrDrawer';
import store from 'src/store';
import capitalize from 'src/utilities/capitalize';
import TableWrapper from './Table';

const linodes = linodeFactory.buildList(10);

class StoryTable extends React.Component {
  handleDialog = (type: string, id: number, label: string) => {
    return;
  };

  handlePowerActionDialog = (
    bootAction: Action,
    id: number,
    label: string,
    configs: Config[]
  ) => {
    return;
  };

  render() {
    return (
      <Provider store={store}>
        <OrderBy data={Object.values(linodes)} orderBy={'label'} order={'asc'}>
          {({ data: orderedData, handleOrderChange, order, orderBy }) => (
            <TableWrapper>
              <SortableTableHead
                order={order}
                orderBy={orderBy}
                handleOrderChange={handleOrderChange}
                toggleLinodeView={() => 'grid'}
                linodesAreGrouped={false}
                toggleGroupLinodes={() => true}
                linodeViewPreference={'list'}
              />

              <TableBody>
                {orderedData.map((linode) => (
                  <LinodeRow
                    key={linode.id}
                    id={linode.id}
                    image={linode.image}
                    ipv4={linode.ipv4}
                    ipv6={linode.ipv6}
                    label={linode.label}
                    backups={linode.backups}
                    displayStatus={capitalize(linode.status)}
                    region={linode.region}
                    status={linode.status}
                    disk={linode.specs.disk}
                    memory={linode.specs.memory}
                    mostRecentBackup={linode.backups.last_successful}
                    tags={linode.tags}
                    openTagDrawer={() => null}
                    type={cachedTypes[0]}
                    vcpus={linode.specs.vcpus}
                    openDialog={this.handleDialog}
                    openPowerActionDialog={this.handlePowerActionDialog}
                    openNotificationDrawer={() => null}
                  ></LinodeRow>
                ))}
              </TableBody>
            </TableWrapper>
          )}
        </OrderBy>
      </Provider>
    );
  }
}

export default {
  title: 'Table',
};

export const Default = () => (
  <TableWrapper>
    <TableHead data-qa-table>
      <TableRow>
        <TableCell style={{ width: '33%' }} data-qa-column-heading>
          Head-1-1
        </TableCell>
        <TableCell style={{ width: '33%' }} data-qa-column-heading>
          Head-1-2
        </TableCell>
        <TableCell style={{ width: '33%' }} data-qa-column-heading>
          Head-1-3
        </TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      <TableRow data-qa-table-row>
        <TableCell data-qa-table-cell>Col-1-1</TableCell>
        <TableCell data-qa-table-cell>
          Col-1-2 content with a long, unbreakable token
          slkjdhgf7890LKAJhsf7890234567q23ghjkjhg
        </TableCell>
        <TableCell data-qa-table-cell>Col-1-3</TableCell>
      </TableRow>
      <TableRow data-qa-table-row>
        <TableCell data-qa-table-cell>Col-2-1</TableCell>
        <TableCell data-qa-table-cell>Col-2-2</TableCell>
        <TableCell data-qa-table-cell>Col-2-3</TableCell>
      </TableRow>
      <TableRow data-qa-table-row>
        <TableCell data-qa-table-cell>Col-3-1</TableCell>
        <TableCell data-qa-table-cell>Col-3-2</TableCell>
        <TableCell data-qa-table-cell>Col-3-3</TableCell>
      </TableRow>
    </TableBody>
  </TableWrapper>
);

export const Sorted = () => <StoryTable />;

Sorted.story = {
  name: 'Sorted',
};
