import { styled, Theme } from '@mui/material/styles';
import Box from 'src/components/core/Box';
import { GravatarByUsername } from 'src/components/GravatarByUsername';
import { makeStyles } from 'tss-react/mui';

export const RenderEventStyledBox = styled(Box, {
  label: 'StyledBox',
})(({ theme }) => ({
  color: theme.textColors.tableHeader,
  paddingLeft: '20px',
  paddingRight: '20px',
  '&:hover': {
    backgroundColor: theme.bg.app,
  },
  gap: 16,
  paddingBottom: 12,
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
