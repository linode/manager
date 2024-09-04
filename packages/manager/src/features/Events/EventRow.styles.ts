import { styled } from '@mui/material/styles';

import { Avatar } from 'src/components/Avatar/Avatar';

// @TODO: delete file
export const StyledAvatar = styled(Avatar, {
  label: 'StyledAvatar',
})(({ theme }) => ({
  '& svg': {
    height: '2vh',
    width: '2vw',
  },
  height: theme.spacing(3),
  width: theme.spacing(3),
}));
