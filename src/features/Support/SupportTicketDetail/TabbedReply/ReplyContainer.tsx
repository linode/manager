import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from '@material-ui/core/styles';
import { lensPath, set } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';

import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';

import AttachFileForm from '../../AttachFileForm';
import { FileAttachment } from '../../index';
import ReplyActions from './ReplyActions';
import TabbedReply from './TabbedReply';

import { createReply, uploadAttachment } from 'src/services/support';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getErrorMap } from 'src/utilities/errorUtils';
import { sanitizeHTML } from 'src/utilities/sanitize-html';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    width: '100%',
    marginLeft: theme.spacing.unit * 2
  }
});

interface Props {
  closable: boolean;
  onSuccess: (newReply: Linode.SupportReply) => void;
  reloadAttachments: () => void;
  ticketId: number;
  closeTicketSuccess: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const ReplyContainer: React.FC<CombinedProps> = props => {
  const { classes, onSuccess, reloadAttachments, ...rest } = props;

  const [errors, setErrors] = React.useState<
    Linode.ApiFieldError[] | undefined
  >(undefined);
  const [value, setValue] = React.useState<string>('');
  const [isSubmitting, setSubmitting] = React.useState<boolean>(false);
  const [files, setFiles] = React.useState<FileAttachment[]>([]);

  const submitForm = () => {
    const sanitizedInput = sanitizeHTML(value);

    if (sanitizedInput !== value) {
      return setErrors([
        {
          reason: `You cannot submit a reply with the currently inputted value. 
        While some markdown is supported, we recommend not attempting to submit HTML directly,
         and instead prefer markdown. Please see the reference guide for allowed markdown values.`,
          field: 'description'
        }
      ]);
    }

    setSubmitting(true);
    setErrors(undefined);

    /* Send the reply */
    createReply({ description: value, ticket_id: props.ticketId })
      .then(response => {
        /** onSuccess callback */
        onSuccess(response);

        setSubmitting(false);
        setValue('');
      })
      .then(() => {
        /* Make sure the reply will go through before attaching files */
        /* Send each file */
        files.map((file, idx) => {
          if (file.uploaded) {
            return;
          }

          setFiles(set(lensPath([idx, 'uploading']), true));

          const formData = new FormData();
          formData.append('file', file.file);

          uploadAttachment(props.ticketId, formData)
            .then(() => {
              const nullFileState = {
                file: null,
                uploading: false,
                uploaded: true
              };

              setFiles(set(lensPath([idx]), nullFileState));
              reloadAttachments();
            })
            /*
             * Note! We want the first few uploads to succeed even if the last few
             * fail! Don't try to aggregate errors!
             */
            .catch(fileErrors => {
              setFiles(set(lensPath([idx, 'uploading']), false));

              const newErrors = getAPIErrorOrDefault(
                fileErrors,
                'There was an error attaching this file. Please try again.'
              );

              setFiles(set(lensPath([idx, 'errors']), newErrors));
            });
        });
      })
      .catch(fetchErrors => {
        setErrors(
          getAPIErrorOrDefault(
            fetchErrors,
            'There was an error creating your reply. Please try again.'
          )
        );
        setSubmitting(false);
      });
  };

  const errorMap = getErrorMap(['description'], errors);

  return (
    <React.Fragment>
      {errorMap.none && (
        <Notice error spacingBottom={8} spacingTop={16} text={errorMap.none} />
      )}
      <TabbedReply
        error={errorMap.description}
        handleChange={setValue}
        value={value}
      />
      <Grid className={classes.root} item>
        <AttachFileForm
          files={files}
          updateFiles={(filesToAttach: FileAttachment[]) =>
            setFiles(filesToAttach)
          }
        />
        <ReplyActions
          isSubmitting={isSubmitting}
          value={value}
          submitForm={submitForm}
          {...rest}
        />
      </Grid>
    </React.Fragment>
  );
};

const styled = withStyles(styles);

export default compose<CombinedProps, Props>(
  styled,
  React.memo
)(ReplyContainer);
