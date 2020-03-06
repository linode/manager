import * as Bluebird from 'bluebird';
import {
  createSupportTicket,
  uploadAttachment
} from 'linode-js-sdk/lib/support';
import { APIError } from 'linode-js-sdk/lib/types';
import { update } from 'ramda';
import * as React from 'react';
import { compose as recompose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import FormHelperText from 'src/components/core/FormHelperText';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import ExpansionPanel from 'src/components/ExpansionPanel';
import Notice from 'src/components/Notice';
import SectionErrorBoundary from 'src/components/SectionErrorBoundary';
import TextField from 'src/components/TextField';
import {
  getAPIErrorOrDefault,
  getErrorMap,
  getErrorStringOrDefault
} from 'src/utilities/errorUtils';
import { getVersionString } from 'src/utilities/getVersionString';
import AttachFileForm from '../AttachFileForm';
import { FileAttachment } from '../index';
import { AttachmentError } from '../SupportTicketDetail/SupportTicketDetail';

import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import Reference from '../SupportTicketDetail/TabbedReply/MarkdownReference';
import TabbedReply from '../SupportTicketDetail/TabbedReply/TabbedReply';

const useStyles = makeStyles((theme: Theme) => ({
  root: {},
  suffix: {
    fontSize: '.9rem',
    marginRight: theme.spacing(1)
  },
  actionPanel: {
    marginTop: theme.spacing(2)
  },
  expPanelSummary: {
    backgroundColor: theme.bg.offWhite,
    borderTop: `1px solid ${theme.bg.main}`
  },
  innerReply: {
    padding: 0
  },
  rootReply: {
    padding: 0,
    marginBottom: theme.spacing(2)
  },
  reference: {
    '& > p': {
      marginBottom: theme.spacing(1)
    }
  }
}));

interface Accumulator {
  success: string[];
  errors: AttachmentError[];
}

interface AttachmentWithTarget {
  file: FormData;
  ticketId: number;
}

export interface Props {
  open: boolean;
  prefilledTitle?: string;
  prefilledDescription?: string;
  onClose: () => void;
  onSuccess: (ticketId: number, attachmentErrors?: AttachmentError[]) => void;
  keepOpenOnSuccess?: boolean;
  hideProductSelection?: boolean;
}

interface Ticket {
  description: string;
  entity_id: string;
  entity_type: string;
  summary: string;
}

export type CombinedProps = Props;

const entityMap = {
  Linodes: 'linode_id',
  Volumes: 'volume_id',
  Domains: 'domain_id',
  NodeBalancers: 'nodebalancer_id',
  Kubernetes: 'cluster_id'
};

const entityIdtoNameMap = {
  linode_id: 'Linode',
  volume_id: 'Volume',
  domain_id: 'Domain',
  nodebalancer_id: 'NodeBalancer',
  cluster_id: 'Kubernetes Cluster'
};

export const entitiesToItems = (type: string, entities: any) => {
  return entities.map((entity: any) => {
    return type === 'domain_id'
      ? // Domains don't have labels
        { value: entity.id, label: entity.domain }
      : { value: entity.id, label: entity.label };
  });
};

export const SupportTicketDrawer: React.FC<CombinedProps> = props => {
  const { open, onClose } = props;

  const defaultTicket: Ticket = {
    summary: props.prefilledTitle || '',
    description: props.prefilledDescription || '',
    entity_type: 'none',
    entity_id: ''
  };

  const [ticket, setTicket] = React.useState<Ticket>(defaultTicket);
  const [data, setData] = React.useState<Item<any>[]>([]);

  const [summary, setSummary] = React.useState<string>('');
  const [description, setDescription] = React.useState<string>('');

  const [inputValue, setInputValue] = React.useState<string>('');
  const [files, setFiles] = React.useState<FileAttachment[]>([]);

  const [errors, setErrors] = React.useState<APIError[] | undefined>();
  const [submitting, setSubmitting] = React.useState<boolean>(false);

  const classes = useStyles();

  React.useEffect(() => {
    if (open) {
      resetDrawer();
    }
  }, [open]);

  // const loadSelectedEntities = () => {
  //   const entity = ticket.entity_type;
  //   switch (entity) {
  //     case 'linode_id': {
  //       return;
  //     }
  //     case 'volume_id': {
  //       return;
  //     }
  //     case 'domain_id': {
  //       return;
  //     }
  //     case 'nodebalancer_id': {
  //       return;
  //     }
  //     case 'cluster_id': {
  //       return;
  //     }
  //     default: {
  //       setData([]);
  //       return;
  //     }
  //   }
  // };

  const resetDrawer = () => {
    setData([]);
    setSummary('');
    setDescription('');
  };

  const handleSummaryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSummary(e.target.value);
  };

  const handleDescriptionInputChange = (value: string) => {
    setDescription('');
    // setErrors?
  };

  const handleEntityTypeChange = (e: Item<string>) => {
    // Don't reset things if the type hasn't changed
    if (ticket.entity_type === e.value) {
      return;
    }
    setTicket({
      ...ticket,
      entity_type: e.value,
      entity_id: ''
    });
    setErrors(undefined);
    setInputValue('');
    setData([]);
  };

  const handleEntityIDChange = (selected: Item | null) => {
    setTicket({
      ...ticket,
      entity_id: selected?.value ? String(selected?.value) : ''
    });
  };

  const getHasNoEntitiesMessage = (): string => {
    if (['none', 'general'].includes(ticket.entity_type)) {
      return '';
    } else if (data.length === 0) {
      // User has selected a type from the drop-down but the entity list is empty.
      return `You don't have any ${
        entityIdtoNameMap[ticket.entity_type]
      }s on your account.`;
    } else {
      // Default case
      return '';
    }
  };

  const close = () => {
    props.onClose();
    resetDrawer();
  };

  const onInputValueChange = (newInputValue: string) => {
    setInputValue(newInputValue);
  };

  const updateFiles = (newFiles: FileAttachment[]) => {
    setFiles(newFiles);
  };

  /* Reducer passed into Bluebird.reduce() below.
   * Unfortunately, this reducer has side effects. Uploads each file and accumulates a list of
   * any upload errors. Also tracks loading state of each individual file. */
  const attachFileReducer = (
    accumulator: Accumulator,
    attachment: AttachmentWithTarget,
    idx: number
  ) => {
    return uploadAttachment(attachment.ticketId, attachment.file)
      .then(() => {
        /* null out an uploaded file after upload */
        setFiles((oldFiles: FileAttachment[]) =>
          update(
            idx,
            { file: null, uploading: false, uploaded: true, name: '' },
            oldFiles
          )
        );
        //   compose(
        //     /* null out an uploaded file after upload */
        //     set(lensPath(['files', idx, 'file']), null),
        //     set(lensPath(['files', idx, 'uploading']), false),
        //     set(lensPath(['files', idx, 'uploaded']), true) as () => boolean
        //   )
        // );
        return accumulator;
      })
      .catch(attachmentErrors => {
        /*
         * Note! We want the first few uploads to succeed even if the last few
         * fail! Don't try to aggregate errors!
         */
        setFiles(oldFiles =>
          update(idx, { ...oldFiles[idx], uploading: false }, oldFiles)
        );
        const newError = getErrorStringOrDefault(
          attachmentErrors,
          'There was an error attaching this file. Please try again.'
        );
        return {
          ...accumulator,
          errors: [
            ...accumulator.errors,
            { error: newError, file: attachment.file.get('name') }
          ]
        };
      });
  };

  /* Called after the ticket is successfully completed. */
  const attachFiles = (ticketId: number) => {
    const filesWithTarget: AttachmentWithTarget[] = files
      .filter(file => !file.uploaded)
      .map((file, idx) => {
        setFiles(oldFiles =>
          update(idx, { ...oldFiles[idx], uploading: true }, oldFiles)
        );
        const formData = new FormData();
        formData.append('file', file.file ?? ''); // Safety check for TS only
        formData.append('name', file.name);
        return { file: formData, ticketId };
      });

    /* Upload each file as an attachment, and return a Promise that will resolve to
     *  an array of aggregated errors that may have occurred for individual uploads. */
    return Bluebird.reduce(filesWithTarget, attachFileReducer, {
      success: [],
      errors: []
    });
  };

  const onSubmit = () => {
    const { onSuccess } = props;
    if (
      !['none', 'general'].includes(ticket.entity_type) &&
      !ticket.entity_id
    ) {
      setErrors([
        {
          field: 'input',
          reason: `Please select a ${entityIdtoNameMap[ticket.entity_type]}.`
        }
      ]);
      return;
    }
    setErrors(undefined);
    setSubmitting(true);

    const versionString = getVersionString();
    const updatedDescription = versionString
      ? description + '\n\n' + versionString
      : description;

    createSupportTicket({
      description: updatedDescription,
      summary,
      [ticket.entity_type]: Number(ticket.entity_id)
    })
      .then(response => {
        setErrors(undefined);
        setSubmitting(false);
        setTicket(defaultTicket);
        return response;
      })
      .then(response => {
        attachFiles(response!.id).then(
          ({ success, errors: _errors }: Accumulator) => {
            if (!props.keepOpenOnSuccess) {
              close();
            }
            /* Errors will be an array of errors, or empty if all attachments succeeded. */
            onSuccess(response!.id, _errors);
          }
        );
      })
      .catch(errResponse => {
        /* This block will only handle errors in creating the actual ticket; attachment
         * errors are handled above. */
        setErrors(getAPIErrorOrDefault(errResponse));
        setSubmitting(false);
        scrollErrorIntoView();
      });
  };

  const renderEntityTypes = () => {
    return Object.keys(entityMap).map((key: string) => {
      return { label: key, value: entityMap[key] };
    });
  };

  const requirementsMet =
    ticket.description.length > 0 && ticket.summary.length > 0;

  const hasErrorFor = getErrorMap(['summary', 'description', 'input'], errors);
  const summaryError = hasErrorFor.summary;
  const descriptionError = hasErrorFor.description;
  const generalError = hasErrorFor.none;
  const inputError = hasErrorFor.input;

  const hasNoEntitiesMessage = getHasNoEntitiesMessage();

  const topicOptions = [
    ...renderEntityTypes(),
    { label: 'None/General', value: 'general' }
  ];

  const selectedTopic = topicOptions.find(eachTopic => {
    return eachTopic.value === ticket.entity_type;
  });

  const selectedEntity =
    data.find(thisEntity => thisEntity.value === ticket.entity_id) || null;

  return (
    <Drawer open={open} onClose={onClose} title="Open a Support Ticket">
      {props.children || (
        <React.Fragment>
          {generalError && <Notice error text={generalError} data-qa-notice />}

          <Typography data-qa-support-ticket-helper-text>
            {`We love our customers, and we're here to help if you need us.
          Please keep in mind that not all topics are within the scope of our support.
          For overall system status, please see `}
            <a
              href="https://status.linode.com"
              target="_blank"
              aria-describedby="external-site"
              rel="noopener noreferrer"
            >
              status.linode.com
            </a>
            .
          </Typography>

          {props.hideProductSelection ? null : (
            <React.Fragment>
              <Select
                options={topicOptions}
                label="What is this regarding?"
                value={selectedTopic}
                onChange={handleEntityTypeChange}
                data-qa-ticket-entity-type
                placeholder="Choose a Product"
                isClearable={false}
              />
              {!['none', 'general'].includes(ticket.entity_type) && (
                <>
                  <Select
                    options={data}
                    value={selectedEntity}
                    disabled={data.length === 0}
                    errorText={inputError}
                    placeholder={`Select a ${
                      entityIdtoNameMap[ticket.entity_type]
                    }`}
                    label={entityIdtoNameMap[ticket.entity_type]}
                    inputValue={inputValue}
                    onChange={handleEntityIDChange}
                    onInputChange={onInputValueChange}
                    data-qa-ticket-entity-id
                    isLoading={false}
                    isClearable={false}
                  />
                  {hasNoEntitiesMessage && (
                    <FormHelperText>{hasNoEntitiesMessage}</FormHelperText>
                  )}
                </>
              )}
            </React.Fragment>
          )}
          <TextField
            label="Title"
            placeholder="Enter a title for your ticket."
            required
            value={ticket.summary}
            onChange={handleSummaryInputChange}
            errorText={summaryError}
            data-qa-ticket-summary
          />
          <TabbedReply
            required
            error={descriptionError}
            handleChange={handleDescriptionInputChange}
            value={ticket.description}
            innerClass={classes.innerReply}
            rootClass={classes.rootReply}
            placeholder={
              "Tell us more about the trouble you're having and any steps you've already taken to resolve it."
            }
          />
          {/* <TicketAttachmentList attachments={attachments} /> */}
          <ExpansionPanel
            heading="Formatting Tips"
            detailProps={{ className: classes.expPanelSummary }}
          >
            <Reference rootClass={classes.reference} />
          </ExpansionPanel>
          <AttachFileForm
            inlineDisplay
            files={files}
            updateFiles={updateFiles}
          />
          <ActionsPanel style={{ marginTop: 16 }}>
            <Button
              onClick={onSubmit}
              disabled={!requirementsMet}
              loading={submitting}
              buttonType="primary"
              data-qa-submit
            >
              Open Ticket
            </Button>
            <Button
              onClick={close}
              buttonType="secondary"
              className="cancel"
              data-qa-cancel
            >
              Cancel
            </Button>
          </ActionsPanel>
        </React.Fragment>
      )}
    </Drawer>
  );
};

export default recompose<CombinedProps, Props>(SectionErrorBoundary)(
  SupportTicketDrawer
);
