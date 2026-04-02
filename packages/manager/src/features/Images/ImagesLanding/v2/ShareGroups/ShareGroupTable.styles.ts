import { styled } from '@mui/material/styles';
import { TableCell } from 'akamai-cds-react-components/Table';

export const StyledActionMenuWrapper = styled(TableCell, {
  label: 'StyledActionMenuWrapper',
})(({ theme }) => ({
  justifyContent: 'flex-end',
  display: 'flex',
  alignItems: 'center',
  flex: '0 1 5%',
  '& button': {
    padding: 0,
    color: theme.tokens.alias.Content.Icon.Primary.Default,
    backgroundColor: 'transparent',
  },
  '& button:hover': {
    backgroundColor: 'transparent',
    color: theme.tokens.alias.Content.Icon.Primary.Hover,
  },
}));

export const StyledGroupCell = styled(TableCell, {
  label: 'StyledGroupCell',
})(({ theme }) => ({
  whiteSpace: 'nowrap',
  flex: '0 1 20%',
  [theme.breakpoints.down('lg')]: {
    flex: '0 1 30%',
  },
  [theme.breakpoints.down('sm')]: {
    width: '20%',
  },
}));

export const StyledDescriptionCell = styled(TableCell, {
  label: 'StyledDescriptionCell',
})(({ theme }) => ({
  flex: '0 1 25%',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  display: 'block',

  [theme.breakpoints.down('lg')]: {
    flex: '0 1 35%',
  },
  [theme.breakpoints.down('sm')]: {
    width: '25%',
  },
}));

export const StyledMemberCountCell = styled(TableCell, {
  label: 'StyledMemberCountCell',
})(({ theme }) => ({
  whiteSpace: 'nowrap',
  flex: '0 1 10%',
  [theme.breakpoints.down('lg')]: {
    flex: '0 1 15%',
  },
}));

export const StyledImageCountCell = styled(TableCell, {
  label: 'StyledImageCountCell',
})(({ theme }) => ({
  whiteSpace: 'nowrap',
  width: '10%',
  flex: '0 1 10%',
  [theme.breakpoints.down('lg')]: {
    flex: '0 1 15%',
  },
}));

export const StyledCreatedCell = styled(TableCell, {
  label: 'StyledCreatedCell',
})(({ theme }) => ({
  whiteSpace: 'nowrap',
  width: '15%',
  flex: '0 1 15%',
}));

export const StyledUpdatedCell = styled(TableCell, {
  label: 'StyledUpdatedCell',
})(({ theme }) => ({
  whiteSpace: 'nowrap',
  width: '15%',
  flex: '0 1 15%',
}));

export const StyledShareGroupsTableHeader = styled('div', {
  label: 'StyledShareGroupsTableHeader',
})(({ theme }) => ({
  '& div.row': {
    padding: 0,
  },
}));