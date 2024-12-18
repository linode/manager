import { Button, Typography, omittedProps } from '@linode/ui';
import { styled } from '@mui/material/styles';

interface DropZoneClassProps {
  dropzoneDisabled: boolean;
  isDragAccept: boolean;
  isDragActive: boolean;
  isDragReject: boolean;
}

export const StyledDropZoneDiv = styled('div', {
  label: 'StyledDropZoneDiv',
  shouldForwardProp: omittedProps([
    'dropzoneDisabled',
    'isDragActive',
    'isDragAccept',
    'isDragReject',
  ]),
})<DropZoneClassProps>(({ theme, ...props }) => ({
  backgroundColor: 'transparent',
  borderColor: theme.palette.primary.main,
  borderStyle: 'dashed',
  borderWidth: 1,
  color: theme.palette.primary.main,
  display: 'flex',
  flexDirection: 'row',
  height: '100%',
  justifyContent: 'space-between',
  marginTop: theme.spacing(2),
  maxHeight: 400,
  minHeight: 140,
  outline: 'none',
  overflow: 'auto',
  padding: theme.spacing(),
  position: 'relative',
  transition: theme.transitions.create(['background-color', 'border-color']),
  ...(props.isDragActive && {
    backgroundColor: theme.color.white,
    // The `active` class active when a user is hovering over the dropzone.
    borderColor: theme.palette.primary.light,
  }),
  ...(props.isDragAccept && {
    // The `accept` class active when a user is hovering over the dropzone
    // with files that will be accepted (based on file size, number of files).
    borderColor: theme.palette.primary.light,
  }),
  ...(props.isDragReject && {
    // The `reject` class active when a user is hovering over the dropzone
    // with files that will be rejected (based on file size, number of files).
    borderColor: theme.color.red,
  }),
  ...(props.dropzoneDisabled && {
    // When the dropzone is disabled
    borderColor: theme.tokens.color.Neutrals[60],
  }),
}));

export const StyledFileUploadsDiv = styled('div', {
  label: 'StyledFileUploadsDiv',
})({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  justifyContent: 'flex-start',
});

export const StyledDropZoneContentDiv = styled('div', {
  label: 'StyledDropZoneContentDiv',
  shouldForwardProp: omittedProps(['uploadZoneActive']),
})<{
  uploadZoneActive: boolean;
}>(({ theme, ...props }) => ({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
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

export const StyledCopy = styled(Typography, {
  label: 'StyledCopy',
})(({ theme }) => ({
  color: theme.palette.text.primary,
  margin: '0 auto',
}));

export const StyledUploadButton = styled(Button, {
  label: 'StyledUploadButton',
})(({ theme }) => ({
  marginTop: theme.spacing(2),
  opacity: 1,
  transition: theme.transitions.create(['opacity']),
}));
