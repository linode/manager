import { TableCell } from '@akamai/cds-components/react/Table';
import { styled } from '@mui/material/styles';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';

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

export const TABLE_CELL_BASE_STYLES: React.CSSProperties = {
  boxSizing: 'border-box',
};

export const StyledShareGroupsTableContainer = styled('div', {
  label: 'StyledShareGroupsTable',
})(({ theme }) => ({
  '& .group-column': {
    minWidth: '20%',
    ...TABLE_CELL_BASE_STYLES,
    [theme.breakpoints.down('lg')]: {
      minWidth: '25%',
      maxWidth: '25%',
    },
    [theme.breakpoints.down('sm')]: {
      minWidth: '30%',
    },
  },
  '& .description-column': {
    minWidth: '25%',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    display: 'block',
    ...TABLE_CELL_BASE_STYLES,
    [theme.breakpoints.down('lg')]: {
      minWidth: '30%',
      maxWidth: '30%',
    },
    [theme.breakpoints.down('sm')]: {
      minWidth: '40%',
    },
  },
  '& .membersCount-column': {
    minWidth: '11%',
    ...TABLE_CELL_BASE_STYLES,
    [theme.breakpoints.down('lg')]: {
      minWidth: '20%',
      maxWidth: '20%',
    },
  },
  '& .imagesCount-column': {
    minWidth: '9%',
    ...TABLE_CELL_BASE_STYLES,
    [theme.breakpoints.down('lg')]: {
      minWidth: '17%',
      maxWidth: '19%',
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
  '& .membership-status-column': {
    minWidth: '22%',
    ...TABLE_CELL_BASE_STYLES,
    whiteSpace: 'nowrap',
  },
  '& .status-changed-column': {
    minWidth: '22%',
    ...TABLE_CELL_BASE_STYLES,
    whiteSpace: 'nowrap',
  },
  '& .action-column': {
    maxWidth: '5%',
    ...TABLE_CELL_BASE_STYLES,
  },
  '& .joined-leave-column': {
    maxWidth: '10%',
    ...TABLE_CELL_BASE_STYLES,
  },
}));

export const StyledCopyIcon = styled(CopyTooltip)(({ theme }) => ({
  '& svg': {
    height: 24,
    top: 1,
    width: 24,
  },
  marginLeft: theme.spacingFunction(4),
}));
