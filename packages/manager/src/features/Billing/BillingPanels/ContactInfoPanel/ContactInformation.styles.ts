import { Typography, VisibilityHideIcon, VisibilityShowIcon } from '@linode/ui';
import { styled } from '@mui/material/styles';

export const StyledTypography = styled(Typography)(({ theme }) => ({
  '& .dif': {
    '& .MuiChip-root': {
      position: 'absolute',
      right: -10,
      top: '-4px',
    },
    position: 'relative',
    width: 'auto',
  },
  marginBottom: theme.spacing(1),
}));

export const StyledVisibilityShowIcon = styled(VisibilityShowIcon)(
  ({ theme }) => ({
    '& path': {
      stroke: theme.palette.primary.main,
    },
    marginRight: theme.spacing(0.5),
  })
);

export const StyledVisibilityHideIcon = styled(VisibilityHideIcon)(
  ({ theme }) => ({
    '& path': {
      stroke: theme.palette.primary.main,
    },
    marginRight: theme.spacing(0.5),
  })
);
