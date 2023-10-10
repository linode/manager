import { Theme, styled } from '@mui/material/styles';

import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableSortCell } from 'src/components/TableSortCell';
import { isPropValid } from 'src/utilities/isPropValid';

import type { StackScriptTableHeadProps } from './StackScriptTableHead';

type CompatibleImageCellProps = Pick<StackScriptTableHeadProps, 'category'>;
type StyledStackScriptCellProps = CompatibleImageCellProps &
  Pick<StackScriptTableHeadProps, 'isSelecting'>;

const TableHeadStyles = (theme: Theme) => {
  return {
    '& span': {
      color: theme.textColors.tableHeader,
    },
    color: theme.textColors.tableHeader,
    top: 104,
  };
};

export const StyledCompatibleImagesCell = styled(TableCell, {
  label: 'StyledCompatibleImagesCell',
  shouldForwardProp: (prop) => isPropValid(['category'], prop),
})<CompatibleImageCellProps>(({ category, theme }) => ({
  ...TableHeadStyles(theme),
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
  ...TableHeadStyles(theme),
  cursor: 'default !important',
}));

const SharedDeployCellStyles = (theme: Theme) => {
  return {
    ...TableHeadStyles(theme),
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

export const StyledSortedDeployCell = styled(TableSortCell, {
  label: 'StyledSortedDeployCell',
})(({ theme }) => ({
  ...SharedDeployCellStyles(theme),
}));

export const StyledDeployCell = styled(TableCell, {
  label: 'StyledDeployCell',
})(({ theme }) => ({
  ...SharedDeployCellStyles(theme),
}));

const SharedRevisionsCellStyles = (theme: Theme) => {
  return {
    ...TableHeadStyles(theme),
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

export const StyledSortedRevisionsCell = styled(TableSortCell, {
  label: 'StyledSortedRevisionsCell',
})(({ theme }) => ({
  ...SharedRevisionsCellStyles(theme),
}));

export const StyledRevisionsCell = styled(TableCell, {
  label: 'StyledRevisionsCell',
})(({ theme }) => ({
  ...SharedRevisionsCellStyles(theme),
}));

const SharedStackScriptCellStyles = (
  category: string | undefined,
  isSelecting: boolean | undefined,
  theme: Theme
) => {
  return {
    ...TableHeadStyles(theme),
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

export const StyledSortedStackScriptCell = styled(TableSortCell, {
  label: 'StyledSortedStackScriptCell',
  shouldForwardProp: (prop) => isPropValid(['category', 'isSelecting'], prop),
})<StyledStackScriptCellProps>(({ category, isSelecting, theme }) => ({
  ...SharedStackScriptCellStyles(category, isSelecting, theme),
}));

export const StyledStackScriptCell = styled(TableSortCell, {
  label: 'StyledStackScriptCell',
  shouldForwardProp: (prop) => isPropValid(['category', 'isSelecting'], prop),
})<StyledStackScriptCellProps>(({ category, isSelecting, theme }) => ({
  ...SharedStackScriptCellStyles(category, isSelecting, theme),
}));

export const StyledStatusCell = styled(TableCell, {
  label: 'StyledStatusCell',
})(({ theme }) => ({
  ...TableHeadStyles(theme),
  cursor: 'default !important',
  width: '7%',
}));
