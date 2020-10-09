import { Config } from '@linode/api-v4/lib/linodes';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import { Provider } from 'react-redux';
import OrderBy from 'src/components/OrderBy';
import TableBody from 'src/components/core/TableBody';
import TableCell from 'src/components/core/TableCell';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import { linodeFactory } from 'src/factories/linodes';
import LinodeRow_CMR from 'src/features/linodes/LinodesLanding/LinodeRow/LinodeRow_CMR';
import SortableTableHead_CMR from 'src/features/linodes/LinodesLanding/SortableTableHead_CMR.tsx';
import { Action } from 'src/features/linodes/PowerActionsDialogOrDrawer';
import store from 'src/store';
import capitalize from 'src/utilities/capitalize';
import TableWrapper from './Table';
import TableWrapper_CMR from './Table';

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
            <TableWrapper_CMR>
              <SortableTableHead_CMR
                order={order}
                orderBy={orderBy}
                handleOrderChange={handleOrderChange}
                toggleLinodeView={() => 'grid'}
                linodesAreGrouped={false}
                toggleGroupLinodes={() => true}
                linodeViewPreference={'list'}
              />

              <TableBody>
                {orderedData.map(linode => (
                  <LinodeRow_CMR
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
                    type={linode.type}
                    vcpus={linode.specs.vcpus}
                    openDialog={this.handleDialog}
                    openPowerActionDialog={this.handlePowerActionDialog}
                    openNotificationDrawer={() => null}
                    isVLAN={false}
                  ></LinodeRow_CMR>
                ))}
              </TableBody>
            </TableWrapper_CMR>
          )}
        </OrderBy>
      </Provider>
    );
  }
}

storiesOf('Table', module).add('Default', () => (
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
));

storiesOf('Table', module).add('CMR - Sorted', () => <StoryTable />);
