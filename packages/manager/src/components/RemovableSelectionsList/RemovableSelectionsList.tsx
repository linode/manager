import Close from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { IconButton } from 'src/components/IconButton';
import { List } from 'src/components/List';
import { ListItem } from 'src/components/ListItem';

export type RemovableItem = {
  id: number;
  label: string;
} & { [key: string]: any };

interface Props {
  /**
   * The descriptionary text to display above the list
   */
  headerText: string;
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
    noDataText,
    onRemove,
    preferredDataLabel,
    selectionData,
  } = props;

  const handleOnClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    selection: RemovableItem
  ) => {
    onRemove(selection);
  };

  return (
    <>
      <SelectedOptionsHeader>{headerText}</SelectedOptionsHeader>
      {selectionData.length > 0 ? (
        <SelectedOptionsList>
          {selectionData.map((selection) => (
            <SelectedOptionsListItem alignItems="center" key={selection.id}>
              <StyledLabel>
                {preferredDataLabel
                  ? selection[preferredDataLabel]
                  : selection.label}
              </StyledLabel>
              <IconButton
                aria-label={`remove ${
                  preferredDataLabel
                    ? selection[preferredDataLabel]
                    : selection.label
                }`}
                disableRipple
                onClick={() => handleOnClick}
                size="medium"
              >
                <Close />
              </IconButton>
            </SelectedOptionsListItem>
          ))}
        </SelectedOptionsList>
      ) : (
        <StyledNoAssignedLinodesBox>
          <StyledLabel>{noDataText}</StyledLabel>
        </StyledNoAssignedLinodesBox>
      )}
    </>
  );
};

const StyledNoAssignedLinodesBox = styled(Box, {
  label: 'StyledNoAssignedLinodesBox',
})(({ theme }) => ({
  background: theme.bg.main,
  display: 'flex',
  flexDirection: 'column',
  height: '52px',
  justifyContent: 'center',
  maxWidth: '416px',
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
})(({ theme }) => ({
  background: theme.bg.main,
  maxHeight: '450px',
  maxWidth: '416px',
  overflow: 'auto',
  padding: '5px 0',
  width: '100%',
}));

const SelectedOptionsListItem = styled(ListItem, {
  label: 'SelectedOptionsListItem',
})(() => ({
  justifyContent: 'space-between',
  paddingBottom: 0,
  paddingTop: 0,
}));

const StyledLabel = styled('span', { label: 'StyledLabel' })(({ theme }) => ({
  color: theme.color.label,
  fontFamily: theme.font.semiBold,
  fontSize: '14px',
}));
