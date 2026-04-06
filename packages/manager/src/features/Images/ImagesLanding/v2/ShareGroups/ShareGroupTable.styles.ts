import { styled } from '@mui/material/styles';
import { TableCell } from 'akamai-cds-react-components/Table';

export const StyledActionMenuWrapper = styled(TableCell, {
  label: 'StyledActionMenuWrapper',
})(({ theme }) => ({
  justifyContent: 'flex-end',
  display: 'flex',
  alignItems: 'center',
  maxWidth: '5%',
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

const TABLE_CELL_BASE_STYLES: React.CSSProperties = {
  boxSizing: 'border-box',
};
const TABLE_CELL_OVERFLOW_STYLES: React.CSSProperties = {
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  display: 'block',
};

export const StyledShareGroupsTableContainer = styled('div', {
  label: 'StyledShareGroupsTable',
})(({ theme }) => ({
  '& .group-column': {
    minWidth: '20%',
    ...TABLE_CELL_BASE_STYLES,
    [theme.breakpoints.down('sm')]: {
      minWidth: '30%',
    },
  },
  '& .description-column': {
    minWidth: '25%',
    ...TABLE_CELL_OVERFLOW_STYLES,
    ...TABLE_CELL_BASE_STYLES,
    [theme.breakpoints.down('lg')]: {
      minWidth: '45%',
    },
    [theme.breakpoints.down('sm')]: {
      minWidth: '40%',
    },
  },
  '& .membersCount-column': {
    minWidth: '11%',
    ...TABLE_CELL_BASE_STYLES,
    [theme.breakpoints.down('lg')]: {
      minWidth: '15%',
    },
  },
  '& .imagesCount-column': {
    minWidth: '9%',
    ...TABLE_CELL_BASE_STYLES,
    [theme.breakpoints.down('lg')]: {
      minWidth: '15%',
    },
  },
  '& .created-column': {
    minWidth: '15%',
    ...TABLE_CELL_BASE_STYLES,
    whiteSpace: 'nowrap',
  },
  '& .updated-column': {
    minWidth: '15%',
    ...TABLE_CELL_BASE_STYLES,
    whiteSpace: 'nowrap',
  },
  '& .action-column': {
    maxWidth: '5%',
    ...TABLE_CELL_BASE_STYLES,
  },
}));
