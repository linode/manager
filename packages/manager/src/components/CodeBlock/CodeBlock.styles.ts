import { styled } from '@mui/material/styles';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';

export const StyledCommandDiv = styled('div', { label: 'StyledCommandDiv' })(
  ({ theme }) => ({
    '& pre': {
      marginBottom: 0,
      marginTop: `${theme.spacing(3)}`,
      overflowX: 'auto',
      padding: 8,
    },
    position: 'relative',
  })
);

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
