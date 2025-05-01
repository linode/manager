import { CloseIcon, InputAdornment, TextField } from '@linode/ui';
import CloudUpload from '@mui/icons-material/CloudUpload';
import Grid from '@mui/material/Grid2';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { LinearProgress } from 'src/components/LinearProgress';

import type { FileAttachment } from './index';
import type { Theme } from '@mui/material/styles';

const useStyles = makeStyles()((theme: Theme) => ({
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

interface Props {
  file: FileAttachment;
  fileIdx: number;
  removeFile: (fileIdx: number) => void;
}

export const AttachFileListItem = (props: Props) => {
  const { classes } = useStyles();

  const { file, fileIdx, removeFile } = props;

  if (file.uploaded) {
    return null;
  }

  const err =
    file.errors && file.errors.length ? file.errors[0].reason : undefined;

  return (
    <Grid container spacing={2}>
      <Grid>
        <TextField
          aria-label="Disabled Text Field"
          className={classes.attachmentField}
          data-testid="attached-file"
          errorText={err}
          hideLabel
          InputProps={{
            endAdornment: (
              <InputAdornment
                className={classes.closeIcon}
                data-qa-inline-delete
                data-testid="delete-button"
                onClick={() => removeFile(fileIdx)}
                position="end"
              >
                <CloseIcon />
              </InputAdornment>
            ),
            startAdornment: (
              <InputAdornment position="end">
                <CloudUpload />
              </InputAdornment>
            ),
          }}
          label="File Attached"
          value={file.name}
        />
      </Grid>
      {file.uploading && (
        <Grid size={12}>
          <LinearProgress
            className={classes.uploadProgress}
            variant="indeterminate"
          />
        </Grid>
      )}
    </Grid>
  );
};
