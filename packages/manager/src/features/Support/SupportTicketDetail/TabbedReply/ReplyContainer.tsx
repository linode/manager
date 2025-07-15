import { uploadAttachment } from '@linode/api-v4';
import { useSupportTicketReplyMutation } from '@linode/queries';
import { Accordion, Notice } from '@linode/ui';
import Grid from '@mui/material/Grid';
import * as React from 'react';
import { debounce } from 'throttle-debounce';
import { makeStyles } from 'tss-react/mui';

import { getAPIErrorOrDefault, getErrorMap } from 'src/utilities/errorUtils';
import { storage } from 'src/utilities/storage';

import { AttachFileForm } from '../../AttachFileForm';
import { updateFileAtIndex } from '../../ticketUtils';
import { MarkdownReference } from './MarkdownReference';
import { ReplyActions } from './ReplyActions';
import { TabbedReply } from './TabbedReply';

import type { FileAttachment } from '../../index';
import type { APIError, SupportReply } from '@linode/api-v4';
import type { Theme } from '@mui/material/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  replyContainer: {
    paddingLeft: theme.spacing(6),
    [theme.breakpoints.down('sm')]: {
      paddingLeft: theme.spacing(5),
    },
  },
}));

interface Props {
  closable: boolean;
  lastReply?: SupportReply;
  onSuccess?: (newReply: SupportReply) => void;
  reloadAttachments: () => void;
  ticketId: number;
}

export const ReplyContainer = (props: Props) => {
  const { classes } = useStyles();

  const { lastReply, onSuccess, reloadAttachments, ...rest } = props;

  const { mutateAsync: createReply } = useSupportTicketReplyMutation();

  const textFromStorage = storage.ticketReply.get();
  const isTextFromStorageForCurrentTicket =
    textFromStorage.ticketId === props.ticketId;

  const [errors, setErrors] = React.useState<APIError[] | undefined>(undefined);
  const [value, setValue] = React.useState<string>(
    isTextFromStorageForCurrentTicket &&
      lastReply?.description !== textFromStorage.text
      ? textFromStorage.text
      : ''
  );

  const [isSubmitting, setSubmitting] = React.useState<boolean>(false);
  const [files, setFiles] = React.useState<FileAttachment[]>([]);

  const saveText = (_text: string, _ticketId: number) => {
    storage.ticketReply.set({ text: _text, ticketId: _ticketId });
  };

  const debouncedSave = React.useRef(debounce(500, false, saveText)).current;

  React.useEffect(() => {
    if (value.length > 0) {
      debouncedSave(value, props.ticketId);
    }
  }, [value, props.ticketId]);

  const submitForm = () => {
    setSubmitting(true);
    setErrors(undefined);

    /*
      Send the reply as the user entered it to the server - no restrictions here
      since we're sanitizing again at render time.
    */
    createReply({ description: value, ticket_id: props.ticketId })
      .then((response) => {
        /** onSuccess callback */
        if (onSuccess) {
          onSuccess(response);
        }

        setSubmitting(false);
        setValue('');
      })
      .then(() => {
        /* Make sure the reply will go through before attaching files */
        /* Send each file */
        files.forEach((file, idx) => {
          if (file.uploaded) {
            return;
          }

          setFiles((prevFiles) =>
            updateFileAtIndex(prevFiles, idx, { uploading: true })
          );

          const formData = new FormData();
          formData.append('file', file.file ?? '');

          uploadAttachment(props.ticketId, formData)
            .then(() => {
              setFiles((prevFiles) =>
                updateFileAtIndex(prevFiles, idx, {
                  file: null,
                  uploaded: true,
                  uploading: false,
                })
              );
              reloadAttachments();
            })
            /*
             * Note! We want the first few uploads to succeed even if the last few
             * fail! Don't try to aggregate errors!
             */
            .catch((fileErrors) => {
              setFiles((prevFiles) =>
                prevFiles.map((f, i) =>
                  i === idx ? { ...f, uploading: false } : f
                )
              );

              const newErrors = getAPIErrorOrDefault(
                fileErrors,
                'There was an error attaching this file. Please try again.'
              );

              setFiles((prevFiles) =>
                updateFileAtIndex(prevFiles, idx, {
                  uploading: false,
                  errors: newErrors,
                })
              );
            });
        });
      })
      .catch((fetchErrors) => {
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
    <Grid className={classes.replyContainer}>
      {errorMap.none && (
        <Notice
          spacingBottom={8}
          spacingTop={16}
          text={errorMap.none}
          variant="error"
        />
      )}
      <TabbedReply
        error={errorMap.description}
        handleChange={setValue}
        isReply
        value={value}
      />
      <Accordion heading="Formatting Tips" sx={{ mt: 2 }}>
        <MarkdownReference isReply />
      </Accordion>
      <Grid>
        <AttachFileForm
          files={files}
          updateFiles={(filesToAttach: FileAttachment[]) =>
            setFiles(filesToAttach)
          }
        />
        <ReplyActions
          isSubmitting={isSubmitting}
          submitForm={submitForm}
          value={value}
          {...rest}
        />
      </Grid>
    </Grid>
  );
};
