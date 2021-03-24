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
  | 'images'
  | 'image';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
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
      alignItems: 'center',
      height: '100%',
      width: 70,
    },
    libRadioLabel: {
      cursor: 'pointer',
      fontSize: '0.875rem',
      lineHeight: '1.125rem',
    },
    libTitle: {
      fontSize: '0.875rem',
      lineHeight: '1.125rem',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      [theme.breakpoints.down('sm')]: {
        wordBreak: 'break-all',
      },
    },
    libDescription: {
      color: theme.cmrTextColors.tableHeader,
      fontSize: '.75rem',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      [theme.breakpoints.between('sm', 'lg')]: {
        wordBreak: 'break-word',
      },
    },
    selectionGrid: {
      flexDirection: 'row',
      flexWrap: 'nowrap',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    stackScriptCell: {
      padding: 0,
      width: '100%',
    },
    stackScriptUsername: {
      color: theme.cmrTextColors.tableStatic,
      fontSize: '0.875rem',
      lineHeight: '1.125rem',
    },
    detailsButton: {
      fontSize: '0.875rem',
      marginTop: 0,
      padding: theme.spacing(),
      width: 100,
      '&:hover, &:focus': {
        backgroundColor: 'transparent',
      },
    },
    images: {
      fontSize: '0.75rem',
      overflowWrap: 'break-word',
    },
    image: {
      display: 'inline-block',
      '& span': {
        paddingRight: 4,
      },
    },
  });
