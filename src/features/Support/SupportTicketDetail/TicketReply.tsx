import { compose, lensPath, pathOr,  set } from 'ramda';
import * as React from 'react';

import InputAdornment from '@material-ui/core/InputAdornment';
import { StyleRulesCallback, WithStyles, withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import AttachFile from '@material-ui/icons/AttachFile';
import CloudUpload from '@material-ui/icons/CloudUpload';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Grid from 'src/components/Grid';
import LinearProgress from 'src/components/LinearProgress';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import { createReply, uploadAttachment } from 'src/services/support';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';

type ClassNames =
  'root'
  | 'form'
  | 'attachFileButton'
  | 'attachmentsContainer'
  | 'attachmentField'
  | 'replyField'
  | 'uploadProgress'

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    width: '100%',
  },
  form: {
    minWidth: '100% !important',
    width: '100vw !important',
  },
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
  replyField: {
    '& > div': {
      maxWidth: '100% !important',
    },
  },
  uploadProgress: {
    maxWidth: 415,
  },
});

interface Props {
  ticketId: number;
  onSuccess: (newReply: Linode.SupportReply) => void;
  reloadAttachments: () => void;
}

interface FileAttachment {
  name: string,
  file: File,
  /* Used to keep track of initial upload status */
  uploading: boolean,
  /* Used to ensure that the file doesn't get uploaded again */
  uploaded: boolean,
  /* Each file needs to keep track of its own errors because each request hits the same endpoint */
  errors?: Linode.ApiFieldError[];
}

interface State {
  value: string;
  submitting: boolean;
  files: FileAttachment[];
  errors?: Linode.ApiFieldError[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

class TicketReply extends React.Component<CombinedProps, State> {
  state: State = {
    value: '',
    submitting: false,
    files: [],
  }

  inputRef = React.createRef<HTMLInputElement>();

  handleReplyInput = (e:React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ value: e.target.value, errors: [] });
  }

  submitForm = () => {
    const { onSuccess, ticketId } = this.props;
    const { value, files } = this.state;

    /* A whitespace reply text (e.g. '    ') will pass the API,
    * but we will filter out blank responses from the list. Prevent the user
    * from submitting blank replies to avoid confusion.
    */
    if (value.trim() === '') {
      this.setState({
        errors: [{'field':'description', 'reason':'Description can\'t be blank.'}],
      });
      return;
    }

    this.setState({
      submitting: true,
      errors: [],
    });

    /* Send the reply */
    createReply({ description: value, ticket_id: ticketId })
      .then((response) => {
        onSuccess(response);
        this.setState({ submitting: false, value: '' });
      })
      .then(() => {
        /* Make sure the reply will go through before attaching files */
        /* Send each file */
        files.map((file, idx) => {
          if (file.uploaded) { return ; } 
          this.setState(set(lensPath(['files', idx, 'uploading']), true));
          const formData = new FormData(); 
          formData.append('file', file.file);
          uploadAttachment(this.props.ticketId, formData)
            .then(() => {
              this.setState(compose(
                /* null out an uploaded file after upload */
                set(lensPath(['files', idx, 'file']), null),
                set(lensPath(['files', idx, 'uploading']), false),
                set(lensPath(['files', idx, 'uploaded']), true),
              ));
              this.props.reloadAttachments();
            })
            /* 
            * Note! We want the first few uploads to succeed even if the last few
            * fail! Don't try to aggregate errors!
            */
            .catch((errors) => {
              this.setState(set(lensPath(['files', idx, 'uploading']), false));
              const error = [{ 'reason': 'There was an error attaching this file. Please try again.' }];
              const newErrors = pathOr(error, ['response', 'data', 'errors'], errors);
              this.setState(set(lensPath(['files', idx, 'errors']), newErrors));
            })
        })
      })
      .catch((errors) => {
        const error = [{ 'reason': 'There was an error creating your reply. Please try again.' }];
        const newErrors = pathOr(error, ['response', 'data', 'errors'], errors);
        this.setState({
          errors: newErrors,
          submitting: false
        });
      })
  }

  clickAttachButton = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (this.inputRef.current) {
      this.inputRef.current.click();
    }
  }

  handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length) {
      const reshapedFiles = [];

      /* tslint:disable-next-line */
      for (let i = 0; i < files.length; i++) {
        reshapedFiles.push({
          name: files[i].name,
          /* The file! These can be quite big */
          file: files[i],
          /* Used to keep track of initial upload status */
          uploading: false,
          /* Used to ensure that the file doesn't get uploaded again */
          uploaded: false,
        });
      }

      this.setState({
        files: [
          ...this.state.files,
          ...reshapedFiles
        ]
      }, () => {
        if (this.inputRef.current) {
          this.inputRef.current.value = '';
        }
      })
    }
  }

  removeFile = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!e.target) { return; }
    const aidx = e.currentTarget.getAttribute('data-file-idx');
    if (!aidx) { return; }
    const idx = +aidx;
    this.setState({
      files: this.state.files.filter((_, i) => i !== idx),
    }, () => {
      if (this.inputRef.current) {
        this.inputRef.current.value = '';
      }
    });
  }

  render() {
    const { classes } = this.props;
    const { errors, submitting, value, files } = this.state;

    const hasErrorFor = getAPIErrorFor({
      description: 'description',
    }, errors);

    const replyError = hasErrorFor('description');
    const generalError = hasErrorFor('none');

    return (
      <Grid className={classes.root} item>
        <Typography variant="headline" className={classes.root} data-qa-title >
          Reply
        </Typography>
        {generalError && <Notice error spacingBottom={8} spacingTop={16} text={generalError} />}
        <TextField
          className={classes.replyField}
          multiline
          rows={5}
          value={value}
          placeholder="Enter your reply"
          onChange={this.handleReplyInput}
          errorText={replyError}
        />
        <input
            ref={this.inputRef}
            type="file"
            multiple
            id="attach-file"
            style={{ display: 'none' }}
            onChange={this.handleFileSelected}
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
        <ActionsPanel style={{ marginTop: 16 }}>
          <Button
            type="primary"
            loading={submitting}
            onClick={this.submitForm}
          >
            Add Update
          </Button>
        </ActionsPanel>
      </Grid>
    )
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(TicketReply);
