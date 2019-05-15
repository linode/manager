import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from '@material-ui/core/styles';
import { lensPath, set } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import { Converter } from 'showdown';

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
import { sanitizeHTML } from 'src/utilities/sanitize-html';

type ClassNames = 'root' | 'reference' | 'referenceRoot';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    width: '100%',
    marginLeft: theme.spacing.unit * 2
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
    /** user may have entered markdown so convert it all to markup */
    const rawMarkup = new Converter().makeHtml(value);
    const sanitizedMarkup = sanitizeHTML(rawMarkup);

    /**
     * at this point, we might have an empty string or an empty p tag
     * if the user entered ONLY bad markup. In this case, just display an
     * error because it's not going to serve as a useful customer support ticket
     */
    if (sanitizedMarkup === '<p></p>' || !sanitizedMarkup) {
      return setErrors([
        {
          reason: `Looks like you're attempting to submit a reply with non-allowed Markup.
          While some Markup is supported, we recommend you use our reference guide and write your
          reply as Markdown.`,
          field: 'description'
        }
      ]);
    }

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
      <Grid item sm={8} xs={12}>
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
      </Grid>
      <Grid className={classes.reference} item sm={3} xs={12}>
        <Reference rootClass={classes.referenceRoot} />
      </Grid>
    </Grid>
  );
};

const styled = withStyles(styles);

export default compose<CombinedProps, Props>(
  React.memo,
  styled
)(ReplyContainer);
