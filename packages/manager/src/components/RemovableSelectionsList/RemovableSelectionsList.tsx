import Close from '@mui/icons-material/Close';
import * as React from 'react';

import { IconButton } from 'src/components/IconButton';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { Tooltip } from 'src/components/Tooltip';

import {
  SelectedOptionsHeader,
  SelectedOptionsList,
  SelectedOptionsListItem,
  StyledBoxShadowWrapper,
  StyledLabel,
  StyledNoAssignedLinodesBox,
  StyledScrollBox,
} from './RemovableSelectionsList.style';
import { Chip } from '../Chip';

export type RemovableItem = {
  id: number;
  label: string;
  // The remaining key-value pairs must have their values typed
  // as 'any' because we do not know what types they could be.
  // Trying to type them as 'unknown' led to type errors.
} & { [key: string]: any };

export interface RemovableSelectionsListProps {
  /**
   * The descriptive text to display above the list
   */
  headerText: string;
  /**
   * If false, hide the remove button
   */
  isRemovable?: boolean;
  /**
   * The maxHeight of the list component, in px. The default max height is 427px.
   */
  maxHeight?: number;
  /**
   * The maxWidth of the list component, in px. The default max width is 416px.
   */
  maxWidth?: number;
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
  tableHeaders?: string[];
}

export const RemovableSelectionsList = (
  props: RemovableSelectionsListProps
) => {
  const {
    headerText,
    isRemovable = true,
    maxHeight = 427,
    maxWidth = 416,
    noDataText,
    onRemove,
    preferredDataLabel,
    selectionData,
    tableHeaders,
  } = props;

  // used to determine when to display a box-shadow to indicate scrollability
  const listRef = React.useRef<HTMLUListElement>(null);
  const [listHeight, setListHeight] = React.useState<number>(0);

  React.useEffect(() => {
    if (listRef.current) {
      setListHeight(listRef.current.clientHeight);
    }
  }, [selectionData]);

  const handleOnClick = (selection: RemovableItem) => {
    onRemove(selection);
  };

  // Used for non-table version
  const selectedOptionsJSX = (
    <StyledBoxShadowWrapper
      displayShadow={listHeight > maxHeight}
      maxWidth={maxWidth}
    >
      <StyledScrollBox maxHeight={maxHeight} maxWidth={maxWidth}>
        <SelectedOptionsList isRemovable={isRemovable} ref={listRef}>
          {selectionData.map((selection) => (
            <SelectedOptionsListItem alignItems="center" key={selection.id}>
              <StyledLabel>
                {preferredDataLabel
                  ? selection[preferredDataLabel]
                  : selection.label}
              </StyledLabel>
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
            </SelectedOptionsListItem>
          ))}
        </SelectedOptionsList>
      </StyledScrollBox>
    </StyledBoxShadowWrapper>
  );

  // Used for table version
  const selectedOptionsJSXForTable = (
    <>
      {selectionData.map((selection) => (
        <TableRow key={selection.id}>
          <TableCell>
            <StyledLabel>
              {preferredDataLabel
                ? selection[preferredDataLabel]
                : selection.label}
            </StyledLabel>
          </TableCell>
          <TableCell>{selection.interfaceData?.ipv4?.vpc ?? null}</TableCell>
          <TableCell>
            {determineNoneSingleOrMultipleWithChip(
              selection.interfaceData?.ip_ranges ?? []
            )}
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
      ))}
    </>
  );

  const tableOfSelectedOptions = (
    <Table>
      <TableHead>
        <TableRow>
          {tableHeaders?.map((thisHeader) => (
            <TableCell key={`removable-selections-list-header-${thisHeader}`}>
              {thisHeader}
            </TableCell>
          ))}
          <TableCell />
        </TableRow>
      </TableHead>
      <TableBody>{selectedOptionsJSXForTable}</TableBody>
    </Table>
  );

  return (
    <>
      <SelectedOptionsHeader>{headerText}</SelectedOptionsHeader>
      {selectionData.length > 0 ? (
        !tableHeaders || tableHeaders.length === 0 ? (
          selectedOptionsJSX
        ) : (
          tableOfSelectedOptions
        )
      ) : (
        <StyledNoAssignedLinodesBox maxWidth={maxWidth}>
          <StyledLabel>{noDataText}</StyledLabel>
        </StyledNoAssignedLinodesBox>
      )}
    </>
  );
};

const determineNoneSingleOrMultipleWithChip = (
  dataArray: string[]
): JSX.Element | string => {
  if (dataArray.length === 0) {
    return 'None';
  }

  if (dataArray.length === 1) {
    return dataArray[0];
  }

  const allDataExceptFirstElement = dataArray.slice(1);

  const remainingData = allDataExceptFirstElement.map((datum) => (
    <>
      <span key={datum}>{datum}</span>
      <br />
    </>
  ));

  return (
    <span style={{ alignItems: 'center', display: 'inline-flex' }}>
      {dataArray[0]}{' '}
      <Tooltip placement="bottom" title={remainingData}>
        <Chip clickable inTable label={`+${remainingData.length}`} />
      </Tooltip>
    </span>
  );
};
