import { Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';

import VisibilityHideIcon from 'src/assets/icons/visibilityHide.svg';
import VisibilityShowIcon from 'src/assets/icons/visibilityShow.svg';

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

// eslint-disable-next-line sonarjs/no-identical-functions
export const StyledVisibilityHideIcon = styled(VisibilityHideIcon)(
  ({ theme }) => ({
    '& path': {
      stroke: theme.palette.primary.main,
    },
    marginRight: theme.spacing(0.5),
  })
);
