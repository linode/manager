import Button from 'src/components/Button';
import { styled } from '@mui/material/styles';
import { isPropValid } from 'src/utilities/isPropValid';
import Typography from 'src/components/core/Typography';
import { makeStyles } from 'tss-react/mui';
import { Theme } from '@mui/material/styles';

export const StyledDropZoneDiv = styled('div')(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  backgroundColor: 'transparent',
  borderColor: theme.palette.primary.main,
  borderStyle: 'dashed',
  borderWidth: 1,
  color: theme.palette.primary.main,
  height: '100%',
  maxHeight: 400,
  marginTop: theme.spacing(2),
  minHeight: 140,
  outline: 'none',
  overflow: 'auto',
  padding: theme.spacing(),
  transition: theme.transitions.create(['border-color', 'background-color']),
}));

export const StyledFileUploadsDiv = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  justifyContent: 'flex-start',
});

export const StyledDropZoneContentDiv = styled('div', {
  shouldForwardProp: (prop) => isPropValid(['uploadZoneActive'], prop),
})<{
  uploadZoneActive: boolean;
}>(({ theme, ...props }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  textAlign: 'center',
  width: '100%',
  ...(props.uploadZoneActive && {
    backgroundColor: 'transparent',
    bottom: theme.spacing(1.5),
    padding: 0,
    position: 'absolute',
    width: `calc(100% - ${theme.spacing(4)})`,
    zIndex: 10,
  }),
}));

export const StyledCopy = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  margin: '0 auto',
}));

export const StyledUploadButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  opacity: 1,
  transition: theme.transitions.create(['opacity']),
}));

export const useStyles = makeStyles()((theme: Theme) => ({
  active: {
    // The `active` class active when a user is hovering over the dropzone.
    borderColor: theme.palette.primary.light,
    backgroundColor: theme.color.white,
  },
  inactive: {
    // When the dropzone is disabled
    borderColor: '#888',
  },
  accept: {
    // The `accept` class active when a user is hovering over the dropzone
    // with files that will be accepted (based on file size, number of files).
    borderColor: theme.palette.primary.light,
  },
  reject: {
    // The `reject` class active when a user is hovering over the dropzone
    // with files that will be rejected (based on file size, number of files).
    borderColor: theme.color.red,
  },
}));
