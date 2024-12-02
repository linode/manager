import { styled } from '@mui/material/styles';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { HighlightedMarkdown } from 'src/components/HighlightedMarkdown/HighlightedMarkdown';

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
      color: theme.tokens.color.Yellow[5],
    },
    '& .hljs-string': {
      color: theme.tokens.color.Yellow[50],
    },
    '& .hljs-symbol': {
      color: theme.tokens.color.Yellow[5],
    },

    '& .hljs-variable': {
      color: 'teal',
    },
    backgroundColor: theme.tokens.color.Neutrals[100],
    color: theme.tokens.color.Yellow[5],
    padding: `${theme.spacing(4)} ${theme.spacing(2)}`,
  },
}));

export const StyledCopyTooltip = styled(CopyTooltip, {
  label: 'StyledCopyTooltip',
})(({ theme }) => ({
  '& svg': {
    color: theme.tokens.color.Green[60],
  },
  '& svg:hover': {
    color: theme.tokens.color.Green[70],
  },
  position: 'absolute',
  right: `${theme.spacing(1.5)}`,
  top: `${theme.spacing(1)}`,
}));
