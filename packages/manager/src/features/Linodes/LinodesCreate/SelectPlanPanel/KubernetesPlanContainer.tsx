import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableCell } from 'src/components/TableCell';
import Hidden from 'src/components/core/Hidden';
import { ExtendedType } from 'src/utilities/extendType';
import { KubernetesPlanSelection } from './KubernetesPlanSelection';

const tableCells = [
  { cellName: 'Plan', testId: 'plan', center: false, noWrap: false },
  { cellName: 'Monthly', testId: 'monthly', center: false, noWrap: false },
  { cellName: 'Hourly', testId: 'hourly', center: false, noWrap: false },
  { cellName: 'RAM', testId: 'ram', center: true, noWrap: false },
  { cellName: 'CPUs', testId: 'cpu', center: true, noWrap: false },
  { cellName: 'Storage', testId: 'storage', center: true, noWrap: false },
  { cellName: 'Quantity', testId: 'quantity', center: false, noWrap: false },
];

interface Props {
  disabled?: boolean;
  getTypeCount: (planId: string) => number;
  onAdd?: (key: string, value: number) => void;
  onSelect: (key: string) => void;
  plans: ExtendedType[];
  selectedID?: string;
  updatePlanCount: (planId: string, newCount: number) => void;
}

export const KubernetesPlanContainer = ({
  disabled,
  getTypeCount,
  onAdd,
  onSelect,
  plans,
  selectedID,
  updatePlanCount,
}: Props) => {
  return (
    <Grid container spacing={2}>
      <Hidden mdUp>
        {plans.map((plan, id) => (
          <KubernetesPlanSelection
            disabled={disabled}
            getTypeCount={getTypeCount}
            idx={id}
            key={id}
            onAdd={onAdd}
            onSelect={onSelect}
            selectedID={selectedID}
            type={plan}
            updatePlanCount={updatePlanCount}
          />
        ))}
      </Hidden>
      <Hidden mdDown>
        <Grid xs={12} lg={12}>
          <Table aria-label="List of Linode Plans" spacingBottom={16}>
            <TableHead>
              <TableRow>
                {tableCells.map(({ cellName, testId, center, noWrap }) => {
                  const attributeValue = `${testId}-header`;
                  return (
                    <TableCell
                      data-qa={attributeValue}
                      center={center}
                      noWrap={noWrap}
                      key={testId}
                    >
                      {cellName === 'Quantity' ? (
                        <p className="visually-hidden">{cellName}</p>
                      ) : (
                        cellName
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody role="grid">
              {plans.map((plan, id) => (
                <KubernetesPlanSelection
                  disabled={disabled}
                  getTypeCount={getTypeCount}
                  idx={id}
                  key={id}
                  onAdd={onAdd}
                  onSelect={onSelect}
                  selectedID={selectedID}
                  type={plan}
                  updatePlanCount={updatePlanCount}
                />
              ))}
            </TableBody>
          </Table>
        </Grid>
      </Hidden>
    </Grid>
  );
};
