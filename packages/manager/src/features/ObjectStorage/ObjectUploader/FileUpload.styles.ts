import type { Theme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import UploadPending from 'src/assets/icons/uploadPending.svg';
import { Typography } from 'src/components/Typography';
import { rotate360 } from 'src/styles/keyframes';
import { makeStyles } from 'tss-react/mui';
import type { FileUploadProps } from './FileUpload';

export const StyledRootContainer = styled('div', {
  label: 'StyledRootContainer',
})<Partial<FileUploadProps>>(({ theme, ...props }) => ({
  marginTop: theme.spacing(0.5),
  marginBottom: theme.spacing(0.5),
  position: 'relative',
  cursor: props.error ? 'pointer' : 'default',
  '&:last-child ': {
    [`&.${useStyles().classes.overwriteNotice}`]: {
      borderBottom: 0,
      paddingBottom: theme.spacing(1),
    },
  },
}));

export const StyledContainer = styled('div', {
  label: 'StyledContainer',
})(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(),
  position: 'relative',
  zIndex: 2,
}));

export const StyledLeftWrapper = styled('div', {
  label: 'StyledLeftWrapper',
})(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginRight: theme.spacing(),
}));

export const StyledRightWrapper = styled('div', {
  label: 'StyledRightWrapper',
})(() => ({
  display: 'flex',
  alignItems: 'center',
}));

export const StyledUploadPending = styled(UploadPending, {
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
  display: 'flex',
  justifyContent: 'center',
  '& button': {
    marginLeft: theme.spacing(),
  },
}));

export const useStyles = makeStyles()((theme: Theme) => ({
  barColorPrimary: {
    backgroundColor: theme.name === 'light' ? '#cce2ff' : '#243142',
  },
  error: {
    color: theme.palette.error.dark,
    '& g': {
      stroke: theme.palette.error.dark,
    },
  },
  iconRight: {
    color: theme.textColors.headlineStatic,
  },
  overwriteNotice: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: `1px solid ${theme.color.grey2}`,
    padding: theme.spacing(),
    paddingTop: 0,
    position: 'relative',
    zIndex: 10,
  },
  progressBar: {
    backgroundColor: theme.bg.app,
    borderRadius: 3,
    height: theme.spacing(5.25),
    width: '100%',
    position: 'absolute',
    zIndex: 1,
  },
}));
