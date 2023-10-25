import Close from '@mui/icons-material/Close';
import * as React from 'react';

import { IconButton } from 'src/components/IconButton';

import {
  SelectedOptionsHeader,
  SelectedOptionsList,
  SelectedOptionsListItem,
  StyledBoxShadowWrapper,
  StyledLabel,
  StyledNoAssignedLinodesBox,
  StyledScrollBox,
} from './RemovableSelectionsList.style';

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

  return (
    <>
      <SelectedOptionsHeader>{headerText}</SelectedOptionsHeader>
      {selectionData.length > 0 ? (
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
      ) : (
        <StyledNoAssignedLinodesBox maxWidth={maxWidth}>
          <StyledLabel>{noDataText}</StyledLabel>
        </StyledNoAssignedLinodesBox>
      )}
    </>
  );
};
