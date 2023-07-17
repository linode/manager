import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { Hidden } from 'src/components/Hidden';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { ExtendedType } from 'src/utilities/extendType';

import { KubernetesPlanSelection } from './KubernetesPlanSelection';

const tableCells = [
  { cellName: 'Plan', center: false, noWrap: false, testId: 'plan' },
  { cellName: 'Monthly', center: false, noWrap: false, testId: 'monthly' },
  { cellName: 'Hourly', center: false, noWrap: false, testId: 'hourly' },
  { cellName: 'RAM', center: true, noWrap: false, testId: 'ram' },
  { cellName: 'CPUs', center: true, noWrap: false, testId: 'cpu' },
  { cellName: 'Storage', center: true, noWrap: false, testId: 'storage' },
  { cellName: 'Quantity', center: false, noWrap: false, testId: 'quantity' },
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
        <Grid lg={12} xs={12}>
          <Table aria-label="List of Linode Plans" spacingBottom={16}>
            <TableHead>
              <TableRow>
                {tableCells.map(({ cellName, center, noWrap, testId }) => {
                  const attributeValue = `${testId}-header`;
                  return (
                    <TableCell
                      center={center}
                      data-qa={attributeValue}
                      key={testId}
                      noWrap={noWrap}
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
