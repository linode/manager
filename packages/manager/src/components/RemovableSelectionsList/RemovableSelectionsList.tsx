import { Box, CloseIcon, IconButton } from '@linode/ui';
import * as React from 'react';

import {
  SelectedOptionsHeader,
  SelectedOptionsList,
  SelectedOptionsListItem,
  StyledBoxShadowWrapper,
  StyledLabel,
  StyledNoAssignedLinodesBox,
  StyledScrollBox,
} from './RemovableSelectionsList.style';

import type { ButtonProps } from '@linode/ui';
import type { SxProps, Theme } from '@mui/material';

export type RemovableItem = {
  // The remaining key-value pairs must have their values typed
  // as 'any' because we do not know what types they could be.
  // Trying to type them as 'unknown' led to type errors.
  [key: string]: any;
  id: number | string;
  label: string;
};

export interface RemovableSelectionsListProps {
  /**
   * If true, disable all items when one is removed to prevent race conditions with multiple removals.
   */
  disableItemsOnRemove?: boolean;
  /**
   * If true, reset loading states. The value should be based on a mutation status.
   */
  hasEncounteredMutationError?: boolean;
  /**
   * The descriptive text to display above the list
   */
  headerText: JSX.Element | string;
  /**
   * The id of the list component
   */
  id?: string;
  /**
   * If false, hide the remove button
   */
  isRemovable?: boolean;
  /**
   * The custom label component
   */
  LabelComponent?: React.ComponentType<{ selection: RemovableItem }>;
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
   * Overrides the render of the X Button
   * Has no effect if isRemovable is false
   */
  RemoveButton?: (props: ButtonProps) => JSX.Element;
  /**
   * The data to display in the list
   */
  selectionData: RemovableItem[];
  /**
   * Will display a loading indicator in place of the remove button when removing an item.
   * Only if isRemovable and RemoveButton are true.
   */
  showLoadingIndicatorOnRemove?: boolean;
  /**
   * Additional styles to apply to the component
   */
  sx?: SxProps<Theme>;
}

export const RemovableSelectionsList = (
  props: RemovableSelectionsListProps
) => {
  const {
    LabelComponent,
    RemoveButton,
    disableItemsOnRemove = false,
    hasEncounteredMutationError,
    headerText,
    id,
    isRemovable = true,
    maxHeight = 427,
    maxWidth = 416,
    noDataText,
    onRemove,
    preferredDataLabel,
    selectionData,
    showLoadingIndicatorOnRemove = false,
    sx,
  } = props;

  // used to determine when to display a box-shadow to indicate scrollability
  const listRef = React.useRef<HTMLUListElement>(null);
  const [listHeight, setListHeight] = React.useState<number>(0);
  const [removingItemId, setRemovingItemId] = React.useState<
    null | number | string
  >(null);
  const [isRemoving, setIsRemoving] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (listRef.current) {
      setListHeight(listRef.current.clientHeight);
    }

    return () => {
      setRemovingItemId(null);
      setIsRemoving(false);
    };
  }, [hasEncounteredMutationError, selectionData]);

  const handleOnClick = (selection: RemovableItem) => {
    setIsRemoving(true);
    setRemovingItemId(selection.id);
    onRemove(selection);
  };

  return (
    <Box data-testid={id} sx={sx}>
      <SelectedOptionsHeader>{headerText}</SelectedOptionsHeader>
      {selectionData.length > 0 ? (
        <StyledBoxShadowWrapper
          displayShadow={listHeight > maxHeight}
          id={id}
          maxWidth={maxWidth}
        >
          <StyledScrollBox maxHeight={maxHeight} maxWidth={maxWidth}>
            <SelectedOptionsList
              data-qa-selection-list
              isRemovable={isRemovable}
              ref={listRef}
            >
              {selectionData.map((selection) => (
                <SelectedOptionsListItem alignItems="center" key={selection.id}>
                  <StyledLabel>
                    {LabelComponent ? (
                      <LabelComponent selection={selection} />
                    ) : preferredDataLabel ? (
                      selection[preferredDataLabel]
                    ) : (
                      selection.label
                    )}
                  </StyledLabel>
                  {isRemovable &&
                    (RemoveButton ? (
                      <RemoveButton
                        disabled={disableItemsOnRemove && isRemoving}
                        loading={
                          showLoadingIndicatorOnRemove &&
                          isRemoving &&
                          removingItemId === selection.id
                        }
                        onClick={() => handleOnClick(selection)}
                      />
                    ) : (
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
                        <CloseIcon />
                      </IconButton>
                    ))}
                </SelectedOptionsListItem>
              ))}
            </SelectedOptionsList>
          </StyledScrollBox>
        </StyledBoxShadowWrapper>
      ) : (
        <StyledNoAssignedLinodesBox id={id} maxWidth={maxWidth}>
          <StyledLabel>{noDataText}</StyledLabel>
        </StyledNoAssignedLinodesBox>
      )}
    </Box>
  );
};
