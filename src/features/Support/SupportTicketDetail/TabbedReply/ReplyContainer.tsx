import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from '@material-ui/core/styles';
import { lensPath, set } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';

import ExpansionPanel from 'src/components/ExpansionPanel';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';

import AttachFileForm from '../../AttachFileForm';
import { FileAttachment } from '../../index';
import Reference from './MarkdownReference';
import ReplyActions from './ReplyActions';
import TabbedReply from './TabbedReply';

import { createReply, uploadAttachment } from 'src/services/support';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getErrorMap } from 'src/utilities/errorUtils';

type ClassNames =
  | 'root'
  | 'replyContainer'
  | 'reference'
  | 'expPanelSummary'
  | 'referenceRoot'
  | 'inner';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    paddingLeft: theme.spacing.unit,
    paddingRight: theme.spacing.unit
  },
  inner: {
    padding: 0
  },
  replyContainer: {
    maxWidth: 600
  },
  expPanelSummary: {
    backgroundColor: theme.bg.offWhite,
    borderTop: `1px solid ${theme.bg.main}`
  },
  referenceRoot: {
    '& > p': {
      marginBottom: theme.spacing.unit
    }
  },
  reference: {
    // backgroundColor: theme.palette.divider,
    [theme.breakpoints.up('sm')]: {
      marginTop: theme.spacing.unit * 7,
      marginRight: theme.spacing.unit / 2,
      marginLeft: theme.spacing.unit / 2,
      padding: `0 !important`
    },
    [theme.breakpoints.down('xs')]: {
      padding: `${theme.spacing.unit * 2}px !important`
    }
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
    setSubmitting(true);
    setErrors(undefined);

    /* 
      Send the reply as the user entered it to the server - no restrictions here 
      since we're sanitizing again at render time.
    */
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
    <Grid container>
      <Grid item xs={12} className={classes.replyContainer}>
        {errorMap.none && (
          <Notice
            error
            spacingBottom={8}
            spacingTop={16}
            text={errorMap.none}
          />
        )}
        <TabbedReply
          error={errorMap.description}
          handleChange={setValue}
          innerClass={classes.inner}
          isReply
          value={value}
        />
        <Grid className={classes.root} item>
          <ExpansionPanel
            heading="Formatting Tips"
            detailProps={{ className: classes.expPanelSummary }}
          >
            <Reference isReply rootClass={classes.referenceRoot} />
          </ExpansionPanel>
        </Grid>
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
      </Grid>
    </Grid>
  );
};

const styled = withStyles(styles);

export default compose<CombinedProps, Props>(
  React.memo,
  styled
)(ReplyContainer);
