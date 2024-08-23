// TODO eventMessagesV2: cleanup unused non V2 components when flag is removed
import { styled } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';

import { Box } from 'src/components/Box';
import { GravatarByUsername } from 'src/components/GravatarByUsername';

import type { Theme } from '@mui/material/styles';

export const RenderEventStyledBox = styled(Box, {
  label: 'StyledBox',
})(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.bg.app,
  },
  color: theme.textColors.tableHeader,
  display: 'flex',
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

export const RenderEventGravatarV2 = styled(GravatarByUsername, {
  label: 'StyledGravatarByUsername',
})(() => ({
  height: 32,
  marginTop: 2,
  minWidth: 32,
  width: 32,
}));

export const useRenderEventStyles = makeStyles()((theme: Theme) => ({
  bar: {
    marginTop: theme.spacing(),
  },
  unseenEvent: {
    color: theme.textColors.headlineStatic,
    textDecoration: 'none',
  },
  unseenEventV2: {
    '&:after': {
      backgroundColor: theme.palette.primary.main,
      content: '""',
      display: 'block',
      height: '100%',
      left: 0,
      position: 'absolute',
      top: 0,
      width: 4,
    },
    backgroundColor: theme.bg.offWhite,
    borderBottom: `1px solid ${theme.bg.main}`,
    position: 'relative',
  },
}));
