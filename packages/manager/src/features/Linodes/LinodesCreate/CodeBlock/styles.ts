import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';

export const useCodeBlockStyles = makeStyles((theme: Theme) => ({
  commandDisplay: {
    position: 'relative',
    '& pre': {
      marginTop: '24px',
      marginBottom: 0,
    },
  },
  commandWrapper: {
    '& .hljs': {
      color: '#f8f8f2',
      backgroundColor: '#32363b',
      padding: `${theme.spacing(4)}px ${theme.spacing(2)}px`,

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
    },
  },
  copyIcon: {
    position: 'absolute',
    top: '8px',
    right: '12px',
    '& svg': {
      color: '#17CF73',
    },
    '& svg:hover': {
      color: '#00B159',
    },
  },
}));
