import { createStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';

export type ClassNames =
  | 'row'
  | 'link'
  | 'libRadio'
  | 'libRadioLabel'
  | 'libTitle'
  | 'libDescription'
  | 'selectionGrid'
  | 'selectionGridDetails'
  | 'selectionGridButton'
  | 'stackScriptCell'
  | 'stackScriptUsername'
  | 'detailsButton'
  | 'images';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const styles = (theme: Theme) =>
  createStyles({
    row: {
      height: 46,
      '& > button': {
        height: 46,
      },
    },
    link: {
      color: theme.textColors.tableStatic,
    },
    libRadio: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
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
      whiteSpace: 'nowrap',
      [theme.breakpoints.down('md')]: {
        wordBreak: 'break-all',
      },
    },
    libDescription: {
      color: theme.textColors.tableHeader,
      fontSize: '.75rem',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      [theme.breakpoints.between('sm', 'xl')]: {
        wordBreak: 'break-word',
      },
    },
    selectionGrid: {
      width: '100%',
      flexWrap: 'nowrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
        alignItems: 'flex-start',
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
    selectionGridButton: {
      [theme.breakpoints.down('sm')]: {
        '&.MuiGrid-item': {
          paddingTop: 0,
          paddingLeft: 0,
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
    detailsButton: {
      fontSize: '0.875rem',
      fontFamily: theme.font.normal,
      marginTop: 0,
      padding: theme.spacing(),
      width: 100,
      '&:hover, &:focus': {
        backgroundColor: 'transparent',
      },
      [theme.breakpoints.down('sm')]: {
        marginBottom: 4,
        marginLeft: 0,
        paddingTop: 4,
        paddingBottom: 4,
      },
    },
    images: {
      fontSize: '0.75rem',
      overflowWrap: 'break-word',
      whiteSpace: 'pre-wrap',
    },
  });
