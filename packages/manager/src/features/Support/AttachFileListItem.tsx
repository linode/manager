import Close from '@mui/icons-material/Close';
import CloudUpload from '@mui/icons-material/CloudUpload';
import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';
import { compose, withHandlers } from 'recompose';

import { LinearProgress } from 'src/components/LinearProgress';
import { TextField } from 'src/components/TextField';
import { InputAdornment } from 'src/components/InputAdornment';

import { FileAttachment } from './index';

const useStyles = makeStyles((theme: Theme) => ({
  attachmentField: {
    '& > div ': {
      backgroundColor: 'transparent',
      border: 0,
    },
    '& svg': {
      color: theme.palette.text.primary,
      fontSize: 22,
      width: 24,
    },
    marginTop: 0,
    [theme.breakpoints.down('sm')]: {
      width: 165,
    },
    width: 415,
  },
  closeIcon: {
    cursor: 'pointer',
  },
  uploadProgress: {
    maxWidth: 415,
  },
}));

interface HandlerProps {
  onClick: () => void;
}

interface Props {
  file: FileAttachment;
  fileIdx: number;
  removeFile: (fileIdx: number) => void;
}

type CombinedProps = Props & HandlerProps;

export const AttachFileListItem: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const { file, onClick } = props;
  if (file.uploaded) {
    return null;
  }
  const err =
    file.errors && file.errors.length ? file.errors[0].reason : undefined;

  return (
    <Grid container spacing={2}>
      <Grid>
        <TextField
          InputProps={{
            endAdornment: (
              <InputAdornment
                className={classes.closeIcon}
                data-qa-inline-delete
                data-testid="delete-button"
                onClick={onClick}
                position="end"
              >
                <Close />
              </InputAdornment>
            ),
            startAdornment: (
              <InputAdornment position="end">
                <CloudUpload />
              </InputAdornment>
            ),
          }}
          aria-label="Disabled Text Field"
          className={classes.attachmentField}
          data-testid="attached-file"
          errorText={err}
          hideLabel
          label="File Attached"
          value={file.name}
        />
      </Grid>
      {file.uploading && (
        <Grid xs={12}>
          <LinearProgress
            className={classes.uploadProgress}
            variant="indeterminate"
          />
        </Grid>
      )}
    </Grid>
  );
};

const enhanced = compose<CombinedProps, Props>(
  withHandlers({
    onClick: (props: Props) => () => {
      props.removeFile(props.fileIdx);
    },
  })
)(AttachFileListItem);
export default enhanced;
