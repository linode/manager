import {
  createReply,
  SupportReply,
  uploadAttachment,
} from '@linode/api-v4/lib/support';
import { APIError } from '@linode/api-v4/lib/types';
import { lensPath, set } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import Accordion from 'src/components/Accordion';
import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import { getAPIErrorOrDefault, getErrorMap } from 'src/utilities/errorUtils';
import { storage } from 'src/utilities/storage';
import { debounce } from 'throttle-debounce';
import AttachFileForm from '../../AttachFileForm';
import { FileAttachment } from '../../index';
import { ExtendedReply } from '../../types';
import Reference from './MarkdownReference';
import ReplyActions from './ReplyActions';
import TabbedReply from './TabbedReply';

const useStyles = makeStyles((theme: Theme) => ({
  replyContainer: {
    paddingLeft: theme.spacing(8),
    [theme.breakpoints.down('xs')]: {
      paddingLeft: theme.spacing(6),
    },
  },
  expPanelSummary: {
    backgroundColor:
      theme.name === 'darkTheme' ? theme.bg.main : theme.bg.white,
    borderTop: `1px solid ${theme.bg.main}`,
    paddingTop: theme.spacing(),
  },
  referenceRoot: {
    '& > p': {
      marginBottom: theme.spacing(),
    },
  },
  reference: {
    [theme.breakpoints.up('sm')]: {
      marginTop: theme.spacing(7),
      marginRight: 4,
      marginLeft: 4,
      padding: `0 !important`,
    },
    [theme.breakpoints.down('xs')]: {
      padding: `${theme.spacing(2)}px !important`,
    },
  },
}));

interface Props {
  closable: boolean;
  onSuccess: (newReply: SupportReply) => void;
  reloadAttachments: () => void;
  ticketId: number;
  closeTicketSuccess: () => void;
  lastReply?: ExtendedReply;
}

type CombinedProps = Props;

const ReplyContainer: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const { onSuccess, reloadAttachments, lastReply, ...rest } = props;

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
        onSuccess(response);

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

          setFiles(set(lensPath([idx, 'uploading']), true));

          const formData = new FormData();
          formData.append('file', file.file ?? '');

          uploadAttachment(props.ticketId, formData)
            .then(() => {
              const nullFileState = {
                file: null,
                uploading: false,
                uploaded: true,
              };

              setFiles(set(lensPath([idx]), nullFileState));
              reloadAttachments();
            })
            /*
             * Note! We want the first few uploads to succeed even if the last few
             * fail! Don't try to aggregate errors!
             */
            .catch((fileErrors) => {
              setFiles(set(lensPath([idx, 'uploading']), false));

              const newErrors = getAPIErrorOrDefault(
                fileErrors,
                'There was an error attaching this file. Please try again.'
              );

              setFiles(set(lensPath([idx, 'errors']), newErrors));
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
    <Grid item className={classes.replyContainer}>
      {errorMap.none && (
        <Notice error spacingBottom={8} spacingTop={16} text={errorMap.none} />
      )}
      <Grid item>
        <TabbedReply
          error={errorMap.description}
          handleChange={setValue}
          isReply
          value={value}
        />
      </Grid>
      <Grid item style={{ marginTop: 8 }}>
        <Accordion
          heading="Formatting Tips"
          defaultExpanded={false}
          detailProps={{ className: classes.expPanelSummary }}
        >
          <Reference isReply rootClass={classes.referenceRoot} />
        </Accordion>
      </Grid>
      <Grid item>
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
    </Grid>
  );
};

export default compose<CombinedProps, Props>(React.memo)(ReplyContainer);
