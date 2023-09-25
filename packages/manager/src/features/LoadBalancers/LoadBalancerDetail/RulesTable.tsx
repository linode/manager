import React from 'react';

import { ActionMenu } from 'src/components/ActionMenu';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import {
  StyledTableCell,
  StyledTableHeadCell,
  StyledTableRow,
} from 'src/features/VPCs/VPCDetail/SubnetLinodeRow.styles';

import type { MatchField, Route } from '@linode/api-v4';

interface Props {
  rules: Route['rules'];
}

const matchFieldMap: Record<MatchField, string> = {
  header: 'HTTP Header',
  host: 'Host',
  method: 'HTTP Method',
  path_prefix: 'Path',
  query: 'Query String',
};

export const RulesTable = ({ rules }: Props) => {
  return (
    <Table aria-label="Rules Table" size="small">
      <TableHead style={{ fontSize: '.875rem' }}>
        <TableRow>
          <StyledTableHeadCell>Execution</StyledTableHeadCell>
          <StyledTableHeadCell>Match Value</StyledTableHeadCell>
          <StyledTableHeadCell>Match Type</StyledTableHeadCell>
          <StyledTableHeadCell>Service Targets</StyledTableHeadCell>
          <StyledTableHeadCell>Session Stickiness</StyledTableHeadCell>
          <StyledTableHeadCell></StyledTableHeadCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rules.length > 0 ? (
          rules.map((rule, index) => (
            <StyledTableRow key={index}>
              <StyledTableCell
                component="th"
                scope="row"
                sx={{ paddingLeft: 6 }}
              >
                {index === 0
                  ? 'First'
                  : index === rules.length - 1
                  ? 'Last'
                  : null}
              </StyledTableCell>
              <StyledTableCell>
                {rule.match_condition.match_value}
              </StyledTableCell>
              <StyledTableCell>
                {matchFieldMap[rule.match_condition.match_field]}
              </StyledTableCell>
              <StyledTableCell>
                {rule.match_condition.service_targets.length}
              </StyledTableCell>
              <StyledTableCell>
                {rule.match_condition.session_stickiness_cookie &&
                rule.match_condition.session_stickiness_ttl
                  ? 'Yes'
                  : 'No'}
              </StyledTableCell>
              <TableCell actionCell>
                {/** TODO: AGLB: The Action menu behavior should be implemented in future AGLB tickets. */}
                <ActionMenu
                  actionsList={[
                    { onClick: () => null, title: 'TBD' },
                    { onClick: () => null, title: 'TBD' },
                    { onClick: () => null, title: 'TBD' },
                  ]}
                  ariaLabel={`Action Menu for Rule ${rule.match_condition.match_value}`}
                />
              </TableCell>
            </StyledTableRow>
          ))
        ) : (
          <TableRowEmpty colSpan={5} message={'No Linodes'} />
        )}
      </TableBody>
    </Table>
  );
};
