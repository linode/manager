import { compose, lensPath, set } from 'ramda';
import * as React from 'react';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import {
  StyleRulesCallback,
  WithStyles,
  withStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import { createReply, uploadAttachment } from 'src/services/support';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';

import AttachFileForm, { FileAttachment } from '../AttachFileForm';
import { reshapeFiles } from '../ticketUtils';
import CloseTicketLink from './CloseTicketLink';

type ClassNames = 'root' | 'form' | 'replyField';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    width: '100%'
  },
  form: {
    minWidth: '100% !important',
    width: '100vw !important'
  },

  replyField: {
    '& > div': {
      maxWidth: '100% !important'
    }
  }
});

interface Props {
  ticketId: number;
  closable: boolean;
  onSuccess: (newReply: Linode.SupportReply) => void;
  closeTicketSuccess: () => void;
  reloadAttachments: () => void;
}

interface State {
  value: string;
  submitting: boolean;
  files: FileAttachment[];
  errors?: Linode.ApiFieldError[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

class TicketReply extends React.Component<CombinedProps, State> {
  mounted: boolean = false;
  state: State = {
    value: '',
    submitting: false,
    files: []
  };

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  handleReplyInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ value: e.target.value, errors: [] });
  };

  submitForm = () => {
    const { onSuccess, ticketId } = this.props;
    const { value, files } = this.state;

    this.setState({
      submitting: true,
      errors: []
    });

    /* Send the reply */
    createReply({ description: value, ticket_id: ticketId })
      .then(response => {
        onSuccess(response);
        this.setState({ submitting: false, value: '' });
      })
      .then(() => {
        /* Make sure the reply will go through before attaching files */
        /* Send each file */
        files.map((file, idx) => {
          if (file.uploaded) {
            return;
          }
          this.setState(set(lensPath(['files', idx, 'uploading']), true));
          const formData = new FormData();
          formData.append('file', file.file);
          uploadAttachment(this.props.ticketId, formData)
            .then(() => {
              this.setState(
                compose(
                  /* null out an uploaded file after upload */
                  set(lensPath(['files', idx, 'file']), null),
                  set(lensPath(['files', idx, 'uploading']), false),
                  set(lensPath(['files', idx, 'uploaded']), true)
                )
              );
              this.props.reloadAttachments();
            })
            /*
             * Note! We want the first few uploads to succeed even if the last few
             * fail! Don't try to aggregate errors!
             */
            .catch(errors => {
              this.setState(set(lensPath(['files', idx, 'uploading']), false));

              const newErrors = getAPIErrorOrDefault(
                errors,
                'There was an error attaching this file. Please try again.'
              );
              this.setState(set(lensPath(['files', idx, 'errors']), newErrors));
            });
        });
      })
      .catch(errors => {
        if (!this.mounted) {
          return;
        }
        const newErrors = getAPIErrorOrDefault(
          errors,
          'There was an error creating your reply. Please try again.'
        );
        this.setState({
          errors: newErrors,
          submitting: false
        });
      });
  };

  handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length) {
      const reshapedFiles = reshapeFiles(files);
      this.setState({
        files: [...this.state.files, ...reshapedFiles]
      });
    }
  };

  updateFiles = (files: FileAttachment[]) => {
    this.setState({ files });
  };

  render() {
    const { classes, closable, closeTicketSuccess, ticketId } = this.props;
    const { errors, submitting, value, files } = this.state;

    const hasErrorFor = getAPIErrorFor(
      {
        description: 'description'
      },
      errors
    );

    const replyError = hasErrorFor('description');
    const generalError = hasErrorFor('none');

    return (
      <React.Fragment>
        <Grid className={classes.root} item>
          <Typography variant="h1" className={classes.root} data-qa-title>
            Reply
          </Typography>
          {generalError && (
            <Notice
              error
              spacingBottom={8}
              spacingTop={16}
              text={generalError}
            />
          )}
          <TextField
            className={classes.replyField}
            multiline
            rows={5}
            value={value}
            placeholder="Enter your reply"
            onChange={this.handleReplyInput}
            errorText={replyError}
          />
          <AttachFileForm
            files={files}
            handleFileSelected={this.handleFileSelected}
            updateFiles={this.updateFiles}
          />
          <ActionsPanel style={{ marginTop: 16 }}>
            <Button
              type="primary"
              loading={submitting}
              onClick={this.submitForm}
            >
              Add Update
            </Button>
          </ActionsPanel>
          {closable && (
            <CloseTicketLink
              ticketId={ticketId}
              closeTicketSuccess={closeTicketSuccess}
            />
          )}
        </Grid>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

export default styled(TicketReply);
