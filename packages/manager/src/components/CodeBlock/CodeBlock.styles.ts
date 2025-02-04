import { styled } from '@mui/material/styles';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';

export const StyledCommandDiv = styled('div', { label: 'StyledCommandDiv' })(
  ({ theme }) => ({
    '& pre': {
      overflowX: 'auto',
      padding: theme.spacing(1.5),
    },
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
      textAlign: "right",
      width: '1rem',
    },
    position: 'relative'
  })
);

export const StyledCopyTooltip = styled(CopyTooltip, {
  label: 'StyledCopyTooltip',
})(({ theme }) => ({
  position: 'absolute',
  right: `${theme.spacing(1.5)}`,
  top: `${theme.spacing(1)}`,
}));
