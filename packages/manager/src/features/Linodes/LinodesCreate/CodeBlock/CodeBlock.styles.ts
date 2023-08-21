import { styled } from '@mui/material/styles';
import { HighlightedMarkdown } from 'src/components/HighlightedMarkdown/HighlightedMarkdown';
import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';

export const StyledCommandDiv = styled('div', { label: 'StyledCommandDiv' })(
  ({ theme }) => ({
    '& pre': {
      marginBottom: 0,
      marginTop: `${theme.spacing(3)}`,
    },
    position: 'relative',
  })
);

export const StyledHighlightedMarkdown = styled(HighlightedMarkdown, {
  label: 'StyledHighlightedMarkdown',
})(({ theme }) => ({
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
    padding: `${theme.spacing(4)} ${theme.spacing(2)}`,
  },
}));

export const StyledCopyTooltip = styled(CopyTooltip, {
  label: 'StyledCopyTooltip',
})(({ theme }) => ({
  '& svg': {
    color: '#17CF73',
  },
  '& svg:hover': {
    color: '#00B159',
  },
  position: 'absolute',
  right: `${theme.spacing(1.5)}`,
  top: `${theme.spacing(1)}`,
}));
