import { Theme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';

import { Box } from 'src/components/Box';
import { GravatarByUsername } from 'src/components/GravatarByUsername';

export const RenderEventStyledBox = styled(Box, {
  label: 'StyledBox',
})(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.bg.app,
  },
  color: theme.textColors.tableHeader,
  gap: 16,
  paddingBottom: 12,
  paddingLeft: '20px',
  paddingRight: '20px',
  paddingTop: 12,
  width: '100%',
}));

export const RenderEventGravatar = styled(GravatarByUsername, {
  label: 'StyledGravatarByUsername',
})(() => ({
  height: 40,
  minWidth: 40,
}));

export const useRenderEventStyles = makeStyles()((theme: Theme) => ({
  bar: {
    marginTop: theme.spacing(),
  },
  unseenEvent: {
    color: theme.textColors.headlineStatic,
    textDecoration: 'none',
  },
}));
