import { Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';

import type { Theme } from '@mui/material/styles';

export const StyledFileUploadsContainer = styled('div', {
  label: 'StyledFileUploadsContainer',
})(() => ({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  justifyContent: 'flex-start',
}));

export const StyledDropZoneContent = styled('div', {
  label: 'StyledDropZoneContent',
})(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: theme.spacing(2),
  textAlign: 'center',
  width: '100%',
}));

export const StyledDropZoneCopy = styled(Typography, {
  label: 'StyledDropZoneCopy',
})(({ theme }) => ({
  color: theme.palette.text.primary,
  margin: '0 auto',
}));

export const useStyles = makeStyles<void, 'uploadButton'>()(
  (theme: Theme, _params, classes) => ({
    UploadZoneActiveButton: {
      [`& .${classes.uploadButton}`]: {
        marginTop: 0,
      },
      backgroundColor: 'transparent',
      bottom: theme.spacing(1.5),
      padding: 0,
      position: 'absolute',
      width: `calc(100% - ${theme.spacing(4)})`,
      zIndex: 10,
    },
    accept: {
      // The `accept` class active when a user is hovering over the dropzone
      // with files that will be accepted (based on file size, number of files).
      borderColor: theme.palette.primary.light,
    },
    active: {
      [`& .${classes.uploadButton}`]: {
        opacity: 0.5,
      },
      backgroundColor: theme.color.white,
      // The `active` class active when a user is hovering over the dropzone.
      borderColor: theme.palette.primary.light,
    },
    dropzone: {
      backgroundColor: 'transparent',
      borderColor: theme.palette.primary.main,
      borderRadius: 6,
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
      [theme.breakpoints.down('md')]: {
        marginLeft: theme.spacing(),
        marginRight: theme.spacing(),
      },
      transition: theme.transitions.create([
        'border-color',
        'background-color',
      ]),
    },
    reject: {
      // The `reject` class active when a user is hovering over the dropzone
      // with files that will be rejected (based on file size, number of files).
      borderColor: theme.color.red,
    },
    root: {
      paddingBottom: 60,
      position: 'relative',
    },
    uploadButton: {
      marginTop: theme.spacing(2),
      opacity: 1,
      transition: theme.transitions.create(['opacity']),
    },
  })
);
