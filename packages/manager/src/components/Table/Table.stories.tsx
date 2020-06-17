import { storiesOf } from '@storybook/react';
import * as React from 'react';
import { Provider } from 'react-redux';
import OrderBy from 'src/components/OrderBy';
import TableBody from 'src/components/core/TableBody';
import TableCell from 'src/components/core/TableCell';
import TableCell_CMR from 'src/components/TableCell/TableCell_CMR.tsx';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import TableRow_CMR from 'src/components/TableRow/TableRow_CMR.tsx';
import TableSortCell_CMR from 'src/components/TableSortCell/TableSortCell_CMR.tsx';
// import LinodeRow_CMR from 'src/features/linodes/LinodesLanding/LinodeRow/LinodeRow_CMR';
import store from 'src/store';
import TableWrapper from './Table';
import TableWrapper_CMR from './Table';

// import { linodeFactory } from 'src/factories/linodes';

// const linodes = linodeFactory.buildList(10);

const data = [
  { key: 1, label: 'test1', status: 'running1' },
  { key: 2, label: 'test2', status: 'running2' }
];

class StoryTable extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <OrderBy data={data} orderBy={'label'} order={'asc'}>
          {({ data: orderedData, handleOrderChange, order, orderBy }) => (
            <TableWrapper_CMR>
              <TableHead>
                <TableRow_CMR>
                  <TableSortCell_CMR
                    active
                    direction={order}
                    handleClick={handleOrderChange}
                    label="label"
                  >
                    Label
                  </TableSortCell_CMR>
                  <TableSortCell_CMR
                    active={false}
                    direction={order}
                    handleClick={handleOrderChange}
                    label="status"
                  >
                    Status
                  </TableSortCell_CMR>
                </TableRow_CMR>
              </TableHead>
              <TableBody>
                {orderedData.map(thisRow => (
                  <TableRow_CMR key={thisRow.key}>
                    <TableCell_CMR parentColumn="label">
                      {thisRow.label}
                    </TableCell_CMR>
                    <TableCell_CMR parentColumn="status">
                      {thisRow.status}
                    </TableCell_CMR>
                  </TableRow_CMR>
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

storiesOf('Table', module).add('CMR - Sorted', () => (
  <StoryTable />
  // <Provider store={store}>
  //   <DisplayLinodes
  //     data={linodes}
  //     display="list"
  //     component={any}
  //     handleOrderChange={() => {}}
  //     openDeleteDialog={() => {}}
  //     openPowerActionDialog={() => {}}
  //     order={'asc'}
  //     orderBy={''}
  //     someLinodesHaveMaintenance={false}
  //   />
  // </Provider>
));
