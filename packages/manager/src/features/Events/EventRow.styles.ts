// @TODO: delete file once Gravatar is sunset
import { styled } from '@mui/material/styles';

import { fadeIn } from 'src/styles/keyframes';

import { GravatarByUsername } from '../../components/GravatarByUsername';

export const StyledGravatar = styled(GravatarByUsername, {
  label: 'StyledGravatar',
})(({ theme }) => ({
  animation: `${fadeIn} 1.75s ease-out forwards`,
  height: theme.spacing(3),
  width: theme.spacing(3),
}));
