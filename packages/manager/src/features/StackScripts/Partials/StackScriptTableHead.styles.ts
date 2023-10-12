import { Theme, styled } from '@mui/material/styles';

import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { omittedProps } from 'src/utilities/omittedProps';

import type { StackScriptTableHeadProps } from './StackScriptTableHead';

const tableHeadStyles = (theme: Theme) => {
  return {
    '& span': {
      color: theme.textColors.tableHeader,
    },
    color: theme.textColors.tableHeader,
    top: 104,
  };
};

export const sharedDeployCellStyles = (theme: Theme) => {
  return {
    ...tableHeadStyles(theme),
    [theme.breakpoints.down('lg')]: {
      width: '15%',
    },
    [theme.breakpoints.down('md')]: {
      width: '17%',
    },
    [theme.breakpoints.down('sm')]: {
      width: '28%',
    },
    width: '10%',
  };
};

export const sharedRevisionsCellStyles = (theme: Theme) => {
  return {
    ...tableHeadStyles(theme),
    [theme.breakpoints.down('lg')]: {
      width: '17%',
    },
    [theme.breakpoints.down('md')]: {
      width: '23%',
    },
    whiteSpace: 'nowrap' as const,
    width: '13%',
  };
};

export const sharedStackScriptCellStyles = (
  category: string | undefined,
  isSelecting: boolean | undefined,
  theme: Theme
) => {
  return {
    ...tableHeadStyles(theme),
    ...(category === 'account'
      ? {
          [theme.breakpoints.down('lg')]: {
            width: '38%',
          },
          [theme.breakpoints.down('md')]: {
            width: '50%',
          },
          [theme.breakpoints.down('sm')]: {
            width: '60%',
          },
          width: '26%',
        }
      : {
          [theme.breakpoints.down('lg')]: {
            width: '48%',
          },
          [theme.breakpoints.down('md')]: {
            width: '50%',
          },
          [theme.breakpoints.down('sm')]: {
            width: '60%',
          },
          width: '36%',
        }),
    ...(isSelecting && {
      paddingLeft: '20px !important',
      width: 'calc(100% - 65px)',
    }),
  };
};

type CompatibleImageCellProps = Pick<StackScriptTableHeadProps, 'category'>;

export const StyledCompatibleImagesCell = styled(TableCell, {
  label: 'StyledCompatibleImagesCell',
  shouldForwardProp: omittedProps(['category']),
})<CompatibleImageCellProps>(({ category, theme }) => ({
  ...tableHeadStyles(theme),
  ...(category === 'account'
    ? {
        width: '20%',
      }
    : {
        width: '26%',
      }),
  cursor: 'default !important',
}));

export const StyledEmptyTableCell = styled(TableCell, {
  label: 'StyledEmptyTableCell',
})(({ theme }) => ({
  ...tableHeadStyles(theme),
  cursor: 'default !important',
}));

export const StyledRootTableHead = styled(TableHead, {
  label: 'StyledRootTableHead',
})(({ theme }) => ({
  '& th': {
    '&:first-of-type': {
      borderLeft: 'none',
    },
    '&:hover': {
      ...theme.applyTableHeaderStyles,
    },
    '&:last-of-type': {
      borderRight: 'none',
    },
    backgroundColor: theme.bg.tableHeader,
    borderBottom: `2px solid ${theme.borderColors.borderTable}`,
    borderTop: `2px solid ${theme.borderColors.borderTable}`,
    fontFamily: theme.font.bold,
    padding: '10px 15px',
  },
}));

export const StyledStatusCell = styled(TableCell, {
  label: 'StyledStatusCell',
})(({ theme }) => ({
  ...tableHeadStyles(theme),
  cursor: 'default !important',
  width: '7%',
}));
