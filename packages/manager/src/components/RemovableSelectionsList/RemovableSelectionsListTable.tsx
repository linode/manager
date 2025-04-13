import { IconButton } from '@linode/ui';
import Close from '@mui/icons-material/Close';
import * as React from 'react';

import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { determineNoneSingleOrMultipleWithChip } from 'src/utilities/noneSingleOrMultipleWithChip';

import { TableRowEmpty } from '../TableRowEmpty/TableRowEmpty';
import {
  SelectedOptionsHeader,
  StyledLabel,
} from './RemovableSelectionsList.style';

export type RemovableItem = {
  // The remaining key-value pairs must have their values typed
  // as 'any' because we do not know what types they could be.
  // Trying to type them as 'unknown' led to type errors.
  [key: string]: any;
  id: number;
  label: string;
};

export interface RemovableSelectionsListTableProps {
  /**
   * The descriptive text to display above the list
   */
  headerText: string;
  /**
   * If false, hide the remove button
   */
  isRemovable?: boolean;
  /**
   * The text to display if there is no data
   */
  noDataText: string;
  /**
   * The action to perform when a data item is clicked
   */
  onRemove: (data: RemovableItem) => void;
  /**
   * Assumes the passed in prop is a key within the selectionData, and that the
   * value of this key is a string.
   * Displays the value of this key as the label of the data item, rather than data.label
   */
  preferredDataLabel?: string;
  /**
   * The data to display in the list
   */
  selectionData: RemovableItem[];
  /**
   * Headers for the table containing the list of selected options
   */
  tableHeaders: string[];
}

export const RemovableSelectionsListTable = (
  props: RemovableSelectionsListTableProps
) => {
  const {
    headerText,
    isRemovable = true,
    noDataText,
    onRemove,
    preferredDataLabel,
    selectionData,
    tableHeaders,
  } = props;

  const handleOnClick = (selection: RemovableItem) => {
    onRemove(selection);
  };

  const selectedOptionsJSX =
    selectionData.length === 0 ? (
      <TableRowEmpty colSpan={4} message={noDataText} />
    ) : (
      selectionData.map((selection) => (
        <TableRow key={selection.id}>
          <TableCell>
            <StyledLabel>
              {preferredDataLabel
                ? selection[preferredDataLabel]
                : selection.label}
            </StyledLabel>
          </TableCell>
          <TableCell>{selection.vpcIPv4 ?? null}</TableCell>
          <TableCell>
            {determineNoneSingleOrMultipleWithChip(selection.vpcRanges ?? [])}
          </TableCell>
          <TableCell>
            {isRemovable && (
              <IconButton
                aria-label={`remove ${
                  preferredDataLabel
                    ? selection[preferredDataLabel]
                    : selection.label
                }`}
                disableRipple
                onClick={() => handleOnClick(selection)}
                size="medium"
              >
                <Close />
              </IconButton>
            )}
          </TableCell>
        </TableRow>
      ))
    );

  const tableHeadersJSX = tableHeaders.map((thisHeader, idx) => {
    const lastHeader = idx === tableHeaders.length - 1;

    return (
      <TableCell
        colSpan={lastHeader ? 2 : 1}
        key={`removable-selections-list-header-${thisHeader}`}
      >
        {thisHeader}
      </TableCell>
    );
  });

  return (
    <>
      <SelectedOptionsHeader>{headerText}</SelectedOptionsHeader>
      <Table>
        <TableHead>
          <TableRow>{tableHeadersJSX}</TableRow>
        </TableHead>
        <TableBody>{selectedOptionsJSX}</TableBody>
      </Table>
    </>
  );
};
