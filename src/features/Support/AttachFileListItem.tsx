import * as React from 'react';
import { compose, withHandlers } from 'recompose';

import Close from '@material-ui/icons/Close';
import CloudUpload from '@material-ui/icons/CloudUpload';

import InputAdornment from 'src/components/core/InputAdornment';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';

import Button from 'src/components/Button';
import Grid from 'src/components/Grid';
import LinearProgress from 'src/components/LinearProgress';
import TextField from 'src/components/TextField';

import { FileAttachment } from './index';

type ClassNames =
  | 'root'
  | 'attachmentField'
  | 'attachmentsContainer'
  | 'closeIcon'
  | 'uploadProgress';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    attachmentsContainer: {
      maxWidth: 800
    },
    attachmentField: {
      marginTop: 0,
      width: 415,
      [theme.breakpoints.down('xs')]: {
        width: 165
      },
      '& > div ': {
        backgroundColor: theme.bg.main,
        border: 0
      },
      '& svg': {
        color: theme.palette.text.primary,
        width: 24,
        fontSize: 22
      }
    },
    closeIcon: {
      cursor: 'pointer'
    },
    uploadProgress: {
      maxWidth: 415
    }
  });

interface HandlerProps {
  onClick: () => void;
}

interface Props {
  inlineDisplay: boolean;
  file: FileAttachment;
  fileIdx: number;
  removeFile: (fileIdx: number) => void;
}

type CombinedProps = Props & HandlerProps & WithStyles<ClassNames>;

export const AttachFileListItem: React.StatelessComponent<
  CombinedProps
> = props => {
  const { classes, file, inlineDisplay, onClick } = props;
  if (file.uploaded) {
    return null;
  }
  const err =
    file.errors && file.errors.length ? file.errors[0].reason : undefined;

  return (
    <React.Fragment>
      <Grid container className={classes.attachmentsContainer}>
        <Grid item>
          <TextField
            className={classes.attachmentField}
            value={file.name}
            errorText={err}
            InputProps={{
              startAdornment: (
                <InputAdornment position="end">
                  <CloudUpload />
                </InputAdornment>
              ),
              endAdornment: inlineDisplay && (
                <InputAdornment
                  onClick={onClick}
                  position="end"
                  className={classes.closeIcon}
                  data-qa-inline-delete
                >
                  <Close />
                </InputAdornment>
              )
            }}
          />
        </Grid>
        {!inlineDisplay && (
          <Grid item>
            <Button
              buttonType="remove"
              data-qa-delete-button
              onClick={onClick}
            />
          </Grid>
        )}
        {file.uploading && (
          <Grid item xs={12}>
            <LinearProgress
              className={classes.uploadProgress}
              variant="indeterminate"
            />
          </Grid>
        )}
      </Grid>
    </React.Fragment>
  );
};

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, Props>(
  styled,
  withHandlers({
    onClick: (props: Props) => () => {
      props.removeFile(props.fileIdx);
    }
  })
)(AttachFileListItem);
export default enhanced;
