import { rotate360, Typography } from '@linode/ui';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { styled } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';

import type { FileUploadProps } from './FileUpload';
import type { Theme } from '@mui/material/styles';

export const StyledRootContainer = styled('div', {
  label: 'StyledRootContainer',
})<Partial<FileUploadProps>>(({ theme, ...props }) => ({
  '&:last-child ': {
    [`&.${useStyles().classes.overwriteNotice}`]: {
      borderBottom: 0,
      paddingBottom: theme.spacing(1),
    },
  },
  cursor: props.error ? 'pointer' : 'default',
  marginBottom: theme.spacing(0.5),
  marginTop: theme.spacing(0.5),
  position: 'relative',
}));

export const StyledContainer = styled('div', {
  label: 'StyledContainer',
})(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(),
  position: 'relative',
  zIndex: 2,
}));

export const StyledLeftWrapper = styled('div', {
  label: 'StyledLeftWrapper',
})(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  marginRight: theme.spacing(),
}));

export const StyledRightWrapper = styled('div', {
  label: 'StyledRightWrapper',
})(() => ({
  alignItems: 'center',
  display: 'flex',
}));

export const StyledUploadPendingIcon = styled(AutorenewIcon, {
  label: 'StyledUploadPending',
})(({ theme }) => ({
  animation: `${rotate360} 2s linear infinite`,
  color: theme.textColors.headlineStatic,
}));

export const StyledFileSizeTypography = styled(Typography, {
  label: 'StyledFileSizeTypography',
})(({ theme }) => ({
  marginRight: theme.spacing(),
}));

export const StyledActionsContainer = styled('div', {
  label: 'StyledActionsContainer',
})(({ theme }) => ({
  '& button': {
    marginLeft: theme.spacing(),
  },
  display: 'flex',
  justifyContent: 'center',
}));

export const useStyles = makeStyles()((theme: Theme) => ({
  barColorPrimary: {
    backgroundColor:
      theme.name === 'light'
        ? theme.tokens.color.Brand[30]
        : theme.tokens.color.Brand[100],
  },
  error: {
    '& g': {
      stroke: theme.palette.error.dark,
    },
    color: theme.palette.error.dark,
  },
  iconRight: {
    color: theme.textColors.headlineStatic,
  },
  overwriteNotice: {
    alignItems: 'center',
    borderBottom: `1px solid ${theme.color.grey2}`,
    display: 'flex',
    justifyContent: 'space-between',
    padding: theme.spacing(),
    paddingTop: 0,
    position: 'relative',
    zIndex: 10,
  },
  progressBar: {
    backgroundColor: theme.bg.app,
    borderRadius: 3,
    height: theme.spacing(5.25),
    position: 'absolute',
    width: '100%',
    zIndex: 1,
  },
}));
