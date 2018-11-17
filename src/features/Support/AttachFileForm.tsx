import * as React from 'react';

import InputAdornment from '@material-ui/core/InputAdornment';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import AttachFile from '@material-ui/icons/AttachFile';
import CloudUpload from '@material-ui/icons/CloudUpload';

import Button from 'src/components/Button';
import Grid from 'src/components/Grid';
import LinearProgress from 'src/components/LinearProgress';
import TextField from 'src/components/TextField';

type ClassNames = 'root'
| 'attachFileButton'
| 'attachmentsContainer'
| 'attachmentField'
| 'uploadProgress';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  attachFileButton: {
    paddingLeft: 14,
    paddingRight: 20,
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit * 2,
  },
  attachmentsContainer: {
    maxWidth: 800,
  },
  attachmentField: {
    marginTop: 0,
    width: 415,
    [theme.breakpoints.down('xs')]: {
      width: 165,
    },
    '& > div ': {
      backgroundColor: theme.bg.main,
      border: 0,
    },
    '& svg': {
      color: theme.palette.text.primary,
      width: 24,
      fontSize: 22,
    },
  },
  uploadProgress: {
    maxWidth: 415,
  },
});

export interface FileAttachment {
  name: string,
  file: File,
  /* Used to keep track of initial upload status */
  uploading: boolean,
  /* Used to ensure that the file doesn't get uploaded again */
  uploaded: boolean,
  /* Each file needs to keep track of its own errors because each request hits the same endpoint */
  errors?: Linode.ApiFieldError[];
}

interface Props {
  files: FileAttachment[];
  handleFileSelected: any;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export class AttachFileForm extends React.Component<CombinedProps, {}> {
  inputRef = React.createRef<HTMLInputElement>();

  clickAttachButton = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (this.inputRef.current) {
      this.inputRef.current.click();
    }
  }

  removeFile = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!e.target) { return; }
    const aidx = e.currentTarget.getAttribute('data-file-idx');
    if (!aidx) { return; }
    const idx = +aidx;
    this.setState({
      files: this.props.files.filter((_, i) => i !== idx),
    }, () => {
      if (this.inputRef.current) {
        this.inputRef.current.value = '';
      }
    });
  }

  selectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.props.handleFileSelected(e);
    if (this.inputRef.current) {
      this.inputRef.current.value = '';
    }
  }

  render() {
    const { classes, files } = this.props;
    return (
      <React.Fragment>
        <input
          ref={this.inputRef}
          type="file"
          multiple
          id="attach-file"
          style={{ display: 'none' }}
          onChange={this.selectFile}
        />
        <Button
          component="span"
          className={classes.attachFileButton}
          type="secondary"
          onClick={this.clickAttachButton}
        >
          <AttachFile />
          Attach a file
        </Button>
        {files.map((file, idx) => (
          file.uploaded
            ? null /* this file has already been uploaded so don't show it */
            : (
              <React.Fragment key={idx}>
                <Grid container className={classes.attachmentsContainer}>
                  <Grid item>
                    <TextField
                      className={classes.attachmentField}
                      value={file.name}
                      errorText={file.errors && file.errors.length && file.errors[0].reason}
                      InputProps={{
                        startAdornment:
                        <InputAdornment position="end">
                          <CloudUpload />
                        </InputAdornment>
                      }}
                    />
                  </Grid>
                  <Grid item>
                    <Button
                      type="remove"
                      data-file-idx={idx}
                      onClick={this.removeFile}
                    />
                  </Grid>
                  {file.uploading &&
                    <Grid item xs={12}>
                      <LinearProgress className={classes.uploadProgress} variant="indeterminate"/>
                    </Grid>
                  }
                </Grid>
              </React.Fragment>
            )
        ))}
      </React.Fragment>
    );
  }
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(AttachFileForm);
