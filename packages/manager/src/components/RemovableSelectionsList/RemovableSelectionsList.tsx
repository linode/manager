import Close from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { IconButton } from 'src/components/IconButton';
import { List } from 'src/components/List';
import { ListItem } from 'src/components/ListItem';

type SelectionDataProps = {
  id: number;
  label: string;
} & {[key: string]: any;};


interface Props {
  selectionData: SelectionDataProps[];
  headerText: string;
  noDataText: string;
  onRemove: (data: SelectionDataProps) => void;
  preferredDataLabel?: string;
}

export const RemovableSelectionsList = (props: Props) => {
  const { selectionData, headerText, noDataText, onRemove, preferredDataLabel } = props;

  return (
    <>
      <SelectedOptionsHeader>{headerText}</SelectedOptionsHeader>
      {selectionData.length > 0 ? (
        <SelectedOptionsList>
          {selectionData.map((selection) => (
            <SelectedOptionsListItem
              alignItems="center"
              key={selection.id}
            >
              <StyledLabel>{preferredDataLabel ? selection[preferredDataLabel] : selection.label}</StyledLabel>
              <IconButton
                onClick={() => onRemove(selection)}
                aria-label={`remove ${preferredDataLabel ? selection[preferredDataLabel] : selection.label}`}
                disableRipple
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

const StyledLabel = styled('span', { label: 'StyledLabel' })(
  ({ theme }) => ({
    color: theme.color.label,
    fontFamily: theme.font.semiBold,
    fontSize: '14px',
  })
);