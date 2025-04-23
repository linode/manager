import { makeStyles } from 'tss-react/mui';

export const useCodeBlockStyles = makeStyles()((theme) => ({
  codeblock: {
    '& pre': {
      borderRadius: theme.spacing(0.5),
      overflowX: 'auto',
      padding: theme.spacing(1.5),
    },
    position: 'relative',
  },
  copyIcon: {
    position: 'absolute',
    right: `${theme.spacing(1.5)}`,
    top: `${theme.spacing(1)}`,
  },
  lineNumbers: {
    code: {
      counterIncrement: 'step 0',
      counterReset: 'step',
    },
    'code .line::before': {
      color: 'rgba(115,138,148,.5)',
      content: 'counter(step)',
      counterIncrement: 'step',
      display: 'inline-block',
      marginRight: '1.5rem',
      textAlign: 'right',
      width: '1rem',
    },
  },
}));
