import { storiesOf } from '@storybook/react';
import * as React from 'react';
import TableBody from 'src/components/core/TableBody';
import TableCell from 'src/components/core/TableCell';
import TableCell_CMR from 'src/components/TableCell/TableCell_CMR.tsx';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import TableRow_CMR from 'src/components/TableRow/TableRow_CMR.tsx';
import TableSortCell_CMR from 'src/components/TableSortCell/TableSortCell_CMR.tsx';
import TableWrapper from './Table';
import TableWrapper_CMR from './Table';

class StoryTable extends React.Component {
  handleClick = (key: string) => {
    return;
  };

  render() {
    return (
      <TableWrapper_CMR>
        <TableHead>
          <TableRow_CMR>
            <TableSortCell_CMR
              active
              direction="asc"
              handleClick={this.handleClick}
              label=""
              style={{ width: '33%' }}
              data-qa-column-heading
            >
              Head-1-1
            </TableSortCell_CMR>
            <TableSortCell_CMR
              active={false}
              direction="asc"
              handleClick={this.handleClick}
              label=""
              style={{ width: '33%' }}
              data-qa-column-heading
            >
              Head-1-2
            </TableSortCell_CMR>
            <TableSortCell_CMR
              active={false}
              direction="asc"
              handleClick={this.handleClick}
              label=""
              style={{ width: '33%' }}
              data-qa-column-heading
            >
              Head-1-3
            </TableSortCell_CMR>
          </TableRow_CMR>
        </TableHead>
        <TableBody>
          <TableRow_CMR data-qa-table-row>
            <TableCell_CMR data-qa-table-cell>Col-1-1</TableCell_CMR>
            <TableCell_CMR data-qa-table-cell>
              Col-1-2 content with a long, unbreakable token
              slkjdhgf7890LKAJhsf7890234567q23ghjkjhg
            </TableCell_CMR>
            <TableCell_CMR data-qa-table-cell>Col-1-3</TableCell_CMR>
          </TableRow_CMR>
          <TableRow_CMR data-qa-table-row>
            <TableCell_CMR data-qa-table-cell>Col-2-1</TableCell_CMR>
            <TableCell_CMR data-qa-table-cell>Col-2-2</TableCell_CMR>
            <TableCell_CMR data-qa-table-cell>Col-2-3</TableCell_CMR>
          </TableRow_CMR>
          <TableRow_CMR data-qa-table-row>
            <TableCell_CMR data-qa-table-cell>Col-3-1</TableCell_CMR>
            <TableCell_CMR data-qa-table-cell>Col-3-2</TableCell_CMR>
            <TableCell_CMR data-qa-table-cell>Col-3-3</TableCell_CMR>
          </TableRow_CMR>
        </TableBody>
      </TableWrapper_CMR>
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
