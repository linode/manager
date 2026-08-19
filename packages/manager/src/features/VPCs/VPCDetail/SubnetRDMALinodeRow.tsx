import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@akamai/cds-components/react';
import { useLinodeInterfacesQuery, useLinodeQuery } from '@linode/queries';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { CollapsibleRow } from 'src/components/CollapsibleTable/CollapsibleRow';
import { TableCell as MuiTableCell } from 'src/components/TableCell';

import { useBreakpoint } from '../hooks/useBreakpoint';
import { RDMAInterfaceRow } from './RDMAInterfaceRow';

interface Props {
  linodeId: number;
  numberOfInterfaces: number;
  vpcId: number;
}

const RDMAInterfacesTableRowHead = () => {
  const showFromSmUp = useBreakpoint('up', 'sm');

  return (
    <TableRow headerborder>
      <TableHeaderCell>Interface ID</TableHeaderCell>
      {showFromSmUp && <TableHeaderCell>MAC Address</TableHeaderCell>}
      <TableHeaderCell>IPv4</TableHeaderCell>
    </TableRow>
  );
};

export const SubnetRDMALinodeRow = (props: Props) => {
  const { linodeId, numberOfInterfaces, vpcId } = props;
  const theme = useTheme();

  const [rdmaInterfacesExpanded, setRdmaInterfacesExpanded] =
    React.useState(false);
  const { data: linode } = useLinodeQuery(linodeId);
  const { data: linodeInterfacesData, isLoading } = useLinodeInterfacesQuery(
    linodeId,
    rdmaInterfacesExpanded
  );

  const rdmaInterfaces = (linodeInterfacesData?.interfaces ?? []).filter(
    (networkInterface) => networkInterface.rdma_vpc?.vpc_id === vpcId
  );

  const OuterTableCells = <MuiTableCell>{numberOfInterfaces}</MuiTableCell>;

  const InnerTable = (
    <Table
      aria-label="RDMA Interfaces"
      style={
        {
          border: `1px solid ${theme.tokens.alias.Border.Normal}`,
          '--token-component-table-header-outlined-border':
            theme.tokens.component.Table.Row.Border,
        } as React.CSSProperties
      }
    >
      <TableHead>{RDMAInterfacesTableRowHead()}</TableHead>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell>
              <div style={{ textAlign: 'center', width: '100%' }}>
                Loading...
              </div>
            </TableCell>
          </TableRow>
        ) : rdmaInterfaces.length === 0 ? (
          <TableRow>
            <TableCell>
              <div style={{ textAlign: 'center', width: '100%' }}>
                No RDMA Interfaces
              </div>
            </TableCell>
          </TableRow>
        ) : (
          rdmaInterfaces.map((networkInterface) => (
            <RDMAInterfaceRow
              key={networkInterface.id}
              networkInterface={networkInterface}
            />
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <CollapsibleRow
      InnerTable={InnerTable}
      label={linode?.label ?? ''}
      linkForLabel={`/linodes/${linodeId}/networking/interfaces`}
      onToggle={setRdmaInterfacesExpanded}
      OuterTableCells={OuterTableCells}
    />
  );
};
