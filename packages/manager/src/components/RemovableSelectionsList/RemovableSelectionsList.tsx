import Close from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { IconButton } from 'src/components/IconButton';
import { List } from 'src/components/List';
import { ListItem } from 'src/components/ListItem';
import { isPropValid } from 'src/utilities/isPropValid';

export type RemovableItem = {
  id: number;
  label: string;
  // The remaining key-value pairs must have their values typed
  // as 'any' because we do not know what types they could be.
  // Trying to type them as 'unknown' led to type errors.
} & { [key: string]: any };

interface Props {
  /**
   * The descriptive text to display above the list
   */
  headerText: string;
  /**
   * If false, hide the remove button
   */
  isRemovable?: boolean;
  /**
   * The maxHeight of the list component, in px
   */
  maxHeight?: number;
  /**
   * The maxWidth of the list component, in px
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

export const RemovableSelectionsList = (props: Props) => {
  const {
    headerText,
    isRemovable,
    maxHeight,
    maxWidth,
    noDataText,
    onRemove,
    preferredDataLabel,
    selectionData,
  } = props;

  const handleOnClick = (selection: RemovableItem) => {
    onRemove(selection);
  };

  return (
    <>
      <SelectedOptionsHeader>{headerText}</SelectedOptionsHeader>
      {selectionData.length > 0 ? (
        <SelectedOptionsList
          sx={{
            maxHeight: maxHeight ? `${maxHeight}px` : '450px',
            maxWidth: maxWidth ? `${maxWidth}px` : '416px',
          }}
          isRemovable={isRemovable}
        >
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
      ) : (
        <StyledNoAssignedLinodesBox maxWidth={maxWidth}>
          <StyledLabel>{noDataText}</StyledLabel>
        </StyledNoAssignedLinodesBox>
      )}
    </>
  );
};

const StyledNoAssignedLinodesBox = styled(Box, {
  label: 'StyledNoAssignedLinodesBox',
  shouldForwardProp: (prop) => isPropValid(['maxWidth'], prop),
})(({ maxWidth, theme }) => ({
  background: theme.name === 'light' ? theme.bg.main : theme.bg.app,
  display: 'flex',
  flexDirection: 'column',
  height: '52px',
  justifyContent: 'center',
  maxWidth: maxWidth ? `${maxWidth}px` : '416px',
  paddingLeft: theme.spacing(2),
  width: '100%',
}));

const SelectedOptionsHeader = styled('h4', {
  label: 'SelectedOptionsHeader',
})(({ theme }) => ({
  color: theme.color.headline,
  fontFamily: theme.font.bold,
  fontSize: '14px',
  textTransform: 'initial',
}));

const SelectedOptionsList = styled(List, {
  label: 'SelectedOptionsList',
  shouldForwardProp: (prop) => isPropValid(['isRemovable'], prop),
})<{ isRemovable?: boolean }>(({ isRemovable, theme }) => ({
  background: theme.name === 'light' ? theme.bg.main : theme.bg.app,
  overflow: 'auto',
  padding: !isRemovable ? '16px 0' : '5px 0',
  width: '100%',
}));

const SelectedOptionsListItem = styled(ListItem, {
  label: 'SelectedOptionsListItem',
})(() => ({
  justifyContent: 'space-between',
  paddingBottom: 0,
  paddingRight: 4,
  paddingTop: 0,
}));

const StyledLabel = styled('span', { label: 'StyledLabel' })(({ theme }) => ({
  color: theme.color.label,
  fontFamily: theme.font.semiBold,
  fontSize: '14px',
}));
