import type { Theme } from '@mui/material/styles';

export const sharedDeployCellStyles = (theme: Theme) => {
  return {
    [theme.breakpoints.down('lg')]: {
      width: '15%',
    },
    [theme.breakpoints.down('md')]: {
      width: '17%',
    },
    [theme.breakpoints.down('sm')]: {
      width: '28%',
    },
    top: 104,
    width: '10%',
  };
};

export const sharedRevisionsCellStyles = (theme: Theme) => {
  return {
    [theme.breakpoints.down('lg')]: {
      width: '17%',
    },
    [theme.breakpoints.down('md')]: {
      width: '23%',
    },
    top: 104,
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
    top: 104,
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
