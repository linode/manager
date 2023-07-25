import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';

export const useCodeBlockStyles = makeStyles((theme: Theme) => ({
  commandDisplay: {
    '& pre': {
      marginBottom: 0,
      marginTop: '24px',
    },
    position: 'relative',
  },
  commandWrapper: {
    '& .hljs': {
      '& .hljs-literal, .hljs-built_in': {
        color: '#f8f8f2',
      },
      '& .hljs-string': {
        color: '#e6db74',
      },
      '& .hljs-symbol': {
        color: '#f8f8f2',
      },

      '& .hljs-variable': {
        color: 'teal',
      },
      backgroundColor: '#32363b',
      color: '#f8f8f2',
      padding: `${theme.spacing(4)}px ${theme.spacing(2)}px`,
    },
  },
  copyIcon: {
    '& svg': {
      color: '#17CF73',
    },
    '& svg:hover': {
      color: '#00B159',
    },
    position: 'absolute',
    right: '12px',
    top: '8px',
  },
}));
