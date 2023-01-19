import { makeStyles, Theme } from 'src/components/core/styles';

export const useCodeBlockStyles = makeStyles((theme: Theme) => ({
  dialog: {
    width: '100%',
    padding: `${theme.spacing()}px ${theme.spacing(2)}px`,
    '& [data-qa-copied]': {
      zIndex: 2,
    },
  },
  commandAndCopy: {
    paddingBottom: theme.spacing(4),
  },
  commandDisplay: {
    // alignItems: 'center',
    backgroundColor: 'black',
    border: `1px solid ${theme.color.border2}`,
    display: 'flex',
    fontFamily: '"UbuntuMono", monospace, sans-serif',
    fontSize: '0.875rem',
    justifyContent: 'space-between',
    lineHeight: 1,
    padding: theme.spacing(),
    position: 'relative',
    whiteSpace: 'nowrap',
    width: '100%',
    wordBreak: 'break-all',
    '& curl': {
      backgroundColor: 'black !important',
    },
    code: {
      backgroundColor: 'black !important',
    },
  },
  hljsiteral: {
    color: 'white',
  },
  hljsStringl: {
    color: '#f29333',
  },
  cliText: {
    height: '1rem',
    overflowX: 'auto',
    overflowY: 'hidden', // For Edge
    paddingRight: 15,
  },
  copyIcon: {
    display: 'flex',
    '& svg': {
      height: '1.5em',
      width: '1.5em',
      color: '#17CF73',
      // color: '#02b159',
    },
  },
  text: {
    marginBottom: theme.spacing(3),
    '& p': {
      lineHeight: 1.5,
    },
  },
}));
