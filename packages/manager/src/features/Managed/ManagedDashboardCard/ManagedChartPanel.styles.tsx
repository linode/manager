import { styled } from '@mui/material/styles';

export const StyledCanvasContainerDiv = styled('div', {
  label: 'StyledCanvasContainerDiv',
})(({ theme }) => ({
  marginTop: theme.spacing(3),
}));

export const StyledGraphControlsDiv = styled('div', {
  label: 'StyledGraphControlsDiv',
})(({ theme }) => ({
  /**
   * hacky solution to solve for a bug where
   * the canvas element under the chart kept ending up with a 0px height
   * so that it was not appearing
   */
  '& canvas': {
    height: `300px !important`,
  },
  '&:before': {
    backgroundColor: theme.palette.divider,
    content: '""',
    height: 'calc(100% - 102px);',
    left: 0,
    position: 'absolute',
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
    top: 52,
    width: 1,
  },
  alignItems: 'center',
  display: 'flex',
  minHeight: 460,
  position: 'relative',
  [theme.breakpoints.up('sm')]: {
    width: '60%',
  },
}));

export const StyledRootDiv = styled('div', { label: 'StyledRootDiv' })({
  position: 'relative',
});
