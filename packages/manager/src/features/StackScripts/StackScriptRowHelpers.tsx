import { Theme } from '@mui/material/styles';
import { createStyles } from '@mui/styles';

export type ClassNames =
  | 'detailsButton'
  | 'images'
  | 'libDescription'
  | 'libRadio'
  | 'libRadioLabel'
  | 'libTitle'
  | 'link'
  | 'row'
  | 'selectionGrid'
  | 'selectionGridButton'
  | 'selectionGridDetails'
  | 'stackScriptCell'
  | 'stackScriptUsername';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const styles = (theme: Theme) =>
  createStyles({
    detailsButton: {
      '&:hover, &:focus': {
        backgroundColor: 'transparent',
      },
      fontFamily: theme.font.normal,
      fontSize: '0.875rem',
      marginTop: 0,
      padding: theme.spacing(),
      [theme.breakpoints.down('sm')]: {
        marginBottom: 4,
        marginLeft: 0,
        paddingBottom: 4,
        paddingTop: 4,
      },
      width: 100,
    },
    images: {
      fontSize: '0.75rem',
      overflowWrap: 'break-word',
      whiteSpace: 'pre-wrap',
    },
    libDescription: {
      color: theme.textColors.tableHeader,
      fontSize: '.75rem',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      [theme.breakpoints.between('sm', 'xl')]: {
        wordBreak: 'break-word',
      },
      whiteSpace: 'nowrap',
    },
    libRadio: {
      alignItems: 'center',
      display: 'flex',
      flexWrap: 'wrap',
      height: '100%',
      width: 70,
    },
    libRadioLabel: {
      cursor: 'pointer',
    },
    libTitle: {
      fontSize: '0.875rem',
      lineHeight: '1.125rem',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      [theme.breakpoints.down('md')]: {
        wordBreak: 'break-all',
      },
      whiteSpace: 'nowrap',
    },
    link: {
      color: theme.textColors.tableStatic,
    },
    row: {
      '& > button': {
        height: 46,
      },
      height: 46,
    },
    selectionGrid: {
      alignItems: 'center',
      flexWrap: 'nowrap',
      justifyContent: 'space-between',
      [theme.breakpoints.down('sm')]: {
        alignItems: 'flex-start',
        flexDirection: 'column',
      },
      width: '100%',
    },
    selectionGridButton: {
      [theme.breakpoints.down('sm')]: {
        '&.MuiGrid-item': {
          paddingLeft: 0,
          paddingTop: 0,
        },
      },
    },
    selectionGridDetails: {
      [theme.breakpoints.down('sm')]: {
        '&.MuiGrid-item': {
          marginTop: 4,
          paddingBottom: 0,
        },
      },
    },
    stackScriptCell: {
      padding: 0,
      width: '100%',
    },
    stackScriptUsername: {
      color: theme.textColors.tableStatic,
      fontSize: '0.875rem',
      lineHeight: '1.125rem',
    },
  });
