import { createStyles, Theme } from 'src/components/core/styles';

export type ClassNames =
  | 'row'
  | 'link'
  | 'libRadio'
  | 'libRadioLabel'
  | 'libTitle'
  | 'libDescription'
  | 'selectionGrid'
  | 'stackScriptCell'
  | 'stackScriptUsername'
  | 'detailsButton'
  | 'images';

export const styles = (theme: Theme) =>
  createStyles({
    row: {
      height: 44,
    },
    link: {
      color: theme.cmrTextColors.tableStatic,
    },
    libRadio: {
      display: 'flex',
      flexWrap: 'wrap',
      height: '100%',
      alignItems: 'center',
      width: 70,
    },
    libRadioLabel: {
      cursor: 'pointer',
    },
    libTitle: {
      fontSize: '0.875rem',
      lineHeight: '1.125rem',
      [theme.breakpoints.down('sm')]: {
        wordBreak: 'break-all',
      },
    },
    libDescription: {
      color: theme.cmrTextColors.tableHeader,
      fontSize: '.75rem',
      [theme.breakpoints.between('sm', 'lg')]: {
        wordBreak: 'break-word',
      },
    },
    selectionGrid: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      [theme.breakpoints.up('sm')]: {
        flexWrap: 'nowrap',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
    },
    stackScriptCell: {
      width: '100%',
    },
    stackScriptUsername: {
      color: theme.cmrTextColors.tableStatic,
    },
    detailsButton: {
      padding: 0,
      fontSize: '0.875rem',
      marginTop: -theme.spacing(1),
      [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(1),
        marginTop: 0,
        width: 100,
      },
      '&:hover, &:focus': {
        backgroundColor: 'transparent',
      },
    },
    images: {
      fontSize: '0.75rem',
    },
  });
