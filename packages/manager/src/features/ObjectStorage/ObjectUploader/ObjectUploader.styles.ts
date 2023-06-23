import type { Theme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import { makeStyles } from 'tss-react/mui';

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
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
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
    root: {
      paddingBottom: 60,
      position: 'relative',
    },
    dropzone: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: 'transparent',
      borderColor: theme.palette.primary.main,
      borderRadius: 6,
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
      transition: theme.transitions.create([
        'border-color',
        'background-color',
      ]),
      [theme.breakpoints.down('md')]: {
        marginRight: theme.spacing(),
        marginLeft: theme.spacing(),
      },
    },
    active: {
      // The `active` class active when a user is hovering over the dropzone.
      borderColor: theme.palette.primary.light,
      backgroundColor: theme.color.white,
      [`& .${classes.uploadButton}`]: {
        opacity: 0.5,
      },
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
    UploadZoneActiveButton: {
      backgroundColor: 'transparent',
      bottom: theme.spacing(1.5),
      padding: 0,
      position: 'absolute',
      width: `calc(100% - ${theme.spacing(4)})`,
      zIndex: 10,
      [`& .${classes.uploadButton}`]: {
        marginTop: 0,
      },
    },
    uploadButton: {
      marginTop: theme.spacing(2),
      opacity: 1,
      transition: theme.transitions.create(['opacity']),
    },
  })
);
