import { Box, Typography } from '@linode/ui';
import { styled } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

export const StyledListItem = styled(Typography, { label: 'StyledTypography' })(
  ({ theme }) => ({
    alignItems: 'center',
    display: 'flex',
    padding: `${theme.spacingFunction(4)} 0`,
  })
);

export const StyledLabel = styled(Box, {
  label: 'StyledLabelBox',
})(({ theme }) => ({
  font: theme.font.bold,
  marginRight: theme.spacingFunction(4),
}));

export const useStyles = makeStyles()((theme) => ({
  copyIcon: {
    '& svg': {
      height: '1em',
      width: '1em',
    },
    color: theme.palette.primary.main,
    display: 'inline-block',
    position: 'relative',
    marginTop: theme.spacingFunction(4),
  },
}));
