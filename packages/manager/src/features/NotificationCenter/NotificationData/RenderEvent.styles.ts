import Box from 'src/components/core/Box';
import { GravatarByUsername } from 'src/components/GravatarByUsername';
import { makeStyles } from 'tss-react/mui';
import { styled } from '@mui/material/styles';
import { Theme } from '@mui/material/styles';

export const RenderEventStyledBox = styled(Box, {
  label: 'StyledBox',
})(({ theme }) => ({
  color: theme.textColors.tableHeader,
  '&:hover': {
    backgroundColor: theme.bg.app,
    // Extends the hover state to the edges of the drawer
    marginLeft: -20,
    marginRight: -20,
    paddingLeft: 20,
    paddingRight: 20,
    width: 'calc(100% + 40px)',
  },
  gap: 16,
  paddingBottom: 12,
  paddingTop: 12,
  width: '100%',
  borderBottom: `solid 1px ${theme.borderColors.borderTypography}`,
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
