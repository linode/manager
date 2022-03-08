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
      background: theme.color.white,
      padding: theme.spacing(2),
      position: 'relative !important' as 'relative',
      left: '0 !important' as '0',
      bottom: '0 !important' as '0',
    },
  },
  checkoutSection: {
    animation: '$fadeIn 225ms linear forwards',
    opacity: 0,
    padding: '12px 0',
    [theme.breakpoints.down('sm')]: {
      '& button': {
        marginLeft: 0,
      },
    },
    [theme.breakpoints.down('md')]: {
      paddingBottom: `0px !important`,
    },
  },
  price: {
    color: theme.color.headline,
    fontSize: '.8rem',
    lineHeight: '1.5em',
    marginTop: theme.spacing(),
  },
  sidebarTitle: {
    fontSize: '1.125rem',
    color: theme.color.headline,
    wordBreak: 'break-word',
  },
  detail: {
    color: theme.color.headline,
    fontSize: '.8rem',
    lineHeight: '1.5em',
  },
  createButton: {
    marginTop: 18,
    [theme.breakpoints.up('lg')]: {
      width: '100%',
    },
  },
}));

export default useStyles;
