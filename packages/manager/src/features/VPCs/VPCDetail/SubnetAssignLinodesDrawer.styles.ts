import { styled } from '@mui/material/styles';

import { Box } from 'src/components/Box';
import { List } from 'src/components/List';
import { ListItem } from 'src/components/ListItem';

export const StyledButtonBox = styled(Box, { label: 'StyledButtonBox' })(
  ({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    margin: `${theme.spacing(3)} 0px`,
  })
);

export const StyledNoAssignedLinodesBox = styled(Box, {
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

export const SelectedOptionsHeader = styled('h4', {
  label: 'SelectedOptionsHeader',
})(({ theme }) => ({
  color: theme.color.headline,
  fontFamily: theme.font.bold,
  fontSize: '14px',
  textTransform: 'initial',
}));

export const SelectedOptionsList = styled(List, {
  label: 'SelectedOptionsList',
})(({ theme }) => ({
  background: theme.bg.main,
  maxHeight: '450px',
  maxWidth: '416px',
  overflow: 'auto',
  padding: '5px 0',
  width: '100%',
}));

export const SelectedOptionsListItem = styled(ListItem, {
  label: 'SelectedOptionsListItem',
})(() => ({
  justifyContent: 'space-between',
  paddingBottom: 0,
  paddingTop: 0,
}));

export const StyledLabel = styled('span', { label: 'StyledLabel' })(
  ({ theme }) => ({
    color: theme.color.label,
    fontFamily: theme.font.semiBold,
    fontSize: '14px',
  })
);
