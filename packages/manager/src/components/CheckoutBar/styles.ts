import { makeStyles, Theme } from 'src/components/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  '@keyframes fadeIn': {
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
  },
  root: {
    minHeight: '24px',
    minWidth: '24px',
    [theme.breakpoints.down('sm')]: {
      position: 'relative !important' as 'relative',
      left: '0 !important' as '0',
      bottom: '0 !important' as '0',
      background: theme.color.white,
      padding: theme.spacing(2),
    },
  },
  checkoutSection: {
    animation: '$fadeIn 225ms linear forwards',
    opacity: 0,
    padding: `${theme.spacing(2)}px 0`,
    [theme.breakpoints.down('sm')]: {
      '& button': {
        marginLeft: 0,
      },
    },
  },
  sidebarTitle: {
    fontSize: '1.5rem',
    color: theme.color.green,
    wordBreak: 'break-word',
  },
  detail: {
    fontSize: '.8rem',
    color: theme.color.headline,
    lineHeight: '1.5em',
  },
  createButton: {
    [theme.breakpoints.up('lg')]: {
      width: '100%',
    },
  },
  price: {
    fontSize: '.8rem',
    color: theme.color.headline,
    lineHeight: '1.5em',
    marginTop: theme.spacing(1),
  },
}));

export default useStyles;
