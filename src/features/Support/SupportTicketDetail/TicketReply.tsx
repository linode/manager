import { compose, lensPath, pathOr,  set } from 'ramda';
import * as React from 'react';

import { StyleRulesCallback, Theme, WithStyles, withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import AttachFile from '@material-ui/icons/AttachFile';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import { createReply, uploadAttachment } from 'src/services/support';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';

type ClassNames = 'root' | 'form' | 'attachFileButton';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
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
  }
});

interface Props {
  ticketId: number;
  onSuccess: (newReply:Linode.SupportReply) => void;
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
    this.setState({ value: e.target.value });
  }

  submitForm = () => {
    const { onSuccess, ticketId } = this.props;
    const { value, files } = this.state;

    this.setState({
      submitting: true,
      errors: [],
    });

    /* Send the reply */
    createReply({ description: value, ticket_id: ticketId })
      .then((response) => {
        onSuccess(response.data);
        this.setState({ submitting: false, value: '' });
      })
      .catch((errors) => {
        const error = [{ 'reason': 'There was an error creating your reply. Please try again.' }];
        const newErrors = pathOr(error, ['response', 'data', 'errors'], errors);
        this.setState({
          errors: newErrors,
          submitting: false
        });
      })

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
  }

  clickAttachButton = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (this.inputRef.current) {
      this.inputRef.current.click();
    }
  }

  handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      this.setState({
        files: [
          ...this.state.files,
          {
            name: e.target.files[0].name,
            /* The file! These can be quite big */
            file: e.target.files[0],
            /* Used to keep track of initial upload status */
            uploading: false,
            /* Used to ensure that the file doesn't get uploaded again */
            uploaded: false,
          }
        ]
      })
    }
  }

  removeFile = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!e.target) { return ; }
    const idx = e.currentTarget.getAttribute('');
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
        {generalError && <Notice error spacingBottom={8} spacingTop={8} text={generalError} />}
        <TextField
          multiline
          rows={5}
          value={value}
          placeholder="Enter your reply"
          onChange={this.handleReplyInput}
          errorText={replyError}
        />
        {files.map((file, idx) => (
          file.uploaded
            ? null /* this file has already been uploaded so don't show it */
            : (
              <React.Fragment>
                <TextField
                  disabled
                  value={file.name}
                  errorText={file.errors && file.errors.length && file.errors[0].reason}
                />
                <Button
                  type="remove"
                  data-file-idx={idx}
                  onClick={this.removeFile}
                />
              </React.Fragment>
            )
        ))}
        <ActionsPanel style={{ marginTop: 16 }}>
          <Button
            type="primary"
            loading={submitting}
            onClick={this.submitForm}
          >
            Send
          </Button>
          <input
            ref={this.inputRef}
            type="file"
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
        </ActionsPanel>
      </Grid>
    )
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(TicketReply);