import * as Bluebird from 'bluebird';
import {
  createSupportTicket,
  uploadAttachment,
} from '@linode/api-v4/lib/support';
import { APIError } from '@linode/api-v4/lib/types';
import { update } from 'ramda';
import * as React from 'react';
import { compose as recompose } from 'recompose';
import { debounce } from 'throttle-debounce';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import FormHelperText from 'src/components/core/FormHelperText';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Dialog from 'src/components/Dialog';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import Accordion from 'src/components/Accordion';
import Notice from 'src/components/Notice';
import SectionErrorBoundary from 'src/components/SectionErrorBoundary';
import TextField from 'src/components/TextField';
import useEntities, { Entity } from 'src/hooks/useEntities';
import {
  getAPIErrorOrDefault,
  getErrorMap,
  getErrorStringOrDefault,
} from 'src/utilities/errorUtils';
import { storage } from 'src/utilities/storage';
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
    marginRight: theme.spacing(1),
  },
  actionPanel: {
    marginTop: theme.spacing(2),
  },
  expPanelSummary: {
    backgroundColor: theme.bg.offWhite,
    borderTop: `1px solid ${theme.bg.main}`,
  },
  innerReply: {
    padding: 0,
  },
  rootReply: {
    padding: 0,
    marginBottom: theme.spacing(2),
  },
  reference: {
    '& > p': {
      marginBottom: theme.spacing(1),
    },
  },
}));

interface Accumulator {
  success: string[];
  errors: AttachmentError[];
}

interface AttachmentWithTarget {
  file: FormData;
  ticketId: number;
}

export type EntityType =
  | 'linode_id'
  | 'volume_id'
  | 'domain_id'
  | 'nodebalancer_id'
  | 'cluster_id'
  | 'none'
  | 'general';

export interface Props {
  open: boolean;
  prefilledTitle?: string;
  prefilledDescription?: string;
  onClose: () => void;
  onSuccess: (ticketId: number, attachmentErrors?: AttachmentError[]) => void;
  keepOpenOnSuccess?: boolean;
  hideProductSelection?: boolean;
}

export type CombinedProps = Props;

const entityMap: Record<string, EntityType> = {
  Linodes: 'linode_id',
  Volumes: 'volume_id',
  Domains: 'domain_id',
  NodeBalancers: 'nodebalancer_id',
  Kubernetes: 'cluster_id',
};

const entityIdToNameMap: Partial<Record<EntityType, string>> = {
  linode_id: 'Linode',
  volume_id: 'Volume',
  domain_id: 'Domain',
  nodebalancer_id: 'NodeBalancer',
  cluster_id: 'Kubernetes Cluster',
};

const entityIdToTypeMap: Record<EntityType, string> = {
  linode_id: 'linodes',
  volume_id: 'volumes',
  domain_id: 'domains',
  nodebalancer_id: 'nodeBalancers',
  cluster_id: 'kubernetesClusters',
  none: 'linodes',
  general: 'linodes',
};

export const entitiesToItems = (type: string, entities: any) => {
  return entities.map((entity: any) => {
    return type === 'domain_id'
      ? // Domains don't have labels
        { value: entity.id, label: entity.domain }
      : { value: entity.id, label: entity.label };
  });
};

export const getInitialValue = (
  fromProps?: string,
  fromStorage?: string
): string => {
  return fromProps ?? fromStorage ?? '';
};

export const SupportTicketDrawer: React.FC<CombinedProps> = (props) => {
  const { open, prefilledDescription, prefilledTitle } = props;

  const valuesFromStorage = storage.supportText.get();

  // Ticket information
  const [summary, setSummary] = React.useState<string>(
    getInitialValue(prefilledTitle, valuesFromStorage.title)
  );
  const [description, setDescription] = React.useState<string>(
    getInitialValue(prefilledDescription, valuesFromStorage.description)
  );
  const [entityType, setEntityType] = React.useState<EntityType>('general');
  const [entityID, setEntityID] = React.useState<string>('');

  // Entities for populating dropdown
  const [data, setData] = React.useState<Item<any>[]>([]);
  const [entitiesLoading, setLoading] = React.useState<boolean>(false);

  const [files, setFiles] = React.useState<FileAttachment[]>([]);

  const [errors, setErrors] = React.useState<APIError[] | undefined>();
  const [submitting, setSubmitting] = React.useState<boolean>(false);

  const entities = useEntities();

  const classes = useStyles();

  React.useEffect(() => {
    if (open) {
      resetDrawer();
    }
  }, [open]);

  const saveText = (_title: string, _description: string) => {
    storage.supportText.set({ title: _title, description: _description });
  };

  // Has to be a ref or else the timeout is redone with each render
  const debouncedSave = React.useRef(debounce(500, false, saveText)).current;

  React.useEffect(() => {
    // Store in-progress work to localStorage
    debouncedSave(summary, description);
  }, [summary, description]);

  const handleSetOrRequestEntities = (
    _entity: Entity<any>,
    _entityType: string
  ) => {
    if (_entity.lastUpdated === 0) {
      setLoading(true);
      setErrors(undefined);
      _entity
        .request()
        .then((response) => {
          setLoading(false);
          setData(entitiesToItems(_entityType, response));
        })
        .catch((_) => setLoading(false)); // Errors through Redux
    } else {
      setData(entitiesToItems(_entityType, _entity.data));
    }
  };

  /**
   * When a new entity type is selected,
   * 1. check to see if we have data for that type.
   * 2. If we don't, request it and assign the result to the selectedEntities state
   * 3. If we do, directly assign the data from Redux to the selectedEntities state
   *
   * NOTE: Using a switch here rather than the entities[entityIdToTypeMap] logic
   * used for error handling below; it's more explicit and safer.
   */
  const loadSelectedEntities = (_entityType: string) => {
    switch (_entityType) {
      case 'linode_id': {
        handleSetOrRequestEntities(entities.linodes, _entityType);
        return;
      }
      case 'volume_id': {
        handleSetOrRequestEntities(entities.volumes, _entityType);
        return;
      }
      case 'domain_id': {
        handleSetOrRequestEntities(entities.domains, _entityType);
        return;
      }
      case 'nodebalancer_id': {
        handleSetOrRequestEntities(entities.nodeBalancers, _entityType);
        return;
      }
      case 'cluster_id': {
        handleSetOrRequestEntities(entities.kubernetesClusters, _entityType);
        return;
      }
      default: {
        setData([]);
        return;
      }
    }
  };

  const resetTicket = (clearValues: boolean = false) => {
    /**
     * Clear the drawer completely if clearValues is passed (as in when closing the drawer)
     * or reset to the default values (from props or localStorage) otherwise.
     */
    const _summary = clearValues
      ? ''
      : getInitialValue(prefilledTitle, valuesFromStorage.title);
    const _description = clearValues
      ? ''
      : getInitialValue(prefilledDescription, valuesFromStorage.description);
    setSummary(_summary);
    setDescription(_description);
    setEntityID('');
    setEntityType('general');
  };

  const resetDrawer = (clearValues: boolean = false) => {
    setData([]);
    resetTicket(clearValues);
    setFiles([]);
  };

  const handleSummaryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSummary(e.target.value);
  };

  const handleDescriptionInputChange = (value: string) => {
    setDescription(value);
    // setErrors?
  };

  const handleEntityTypeChange = (e: Item<string>) => {
    // Don't reset things if the type hasn't changed
    if (entityType === e.value) {
      return;
    }
    setEntityType(e.value as EntityType);
    setEntityID('');
    setErrors(undefined);
    setData([]);

    loadSelectedEntities(e.value as EntityType);
  };

  const handleEntityIDChange = (selected: Item | null) => {
    setEntityID(String(selected?.value) ?? '');
  };

  const getHasNoEntitiesMessage = (): string => {
    if (['none', 'general'].includes(entityType)) {
      return '';
    } else if (data.length === 0 && !entityError) {
      // User has selected a type from the drop-down but the entity list is empty.
      return `You don't have any ${entityIdToNameMap[entityType]}s on your account.`;
    } else {
      // Default case
      return '';
    }
  };

  const close = () => {
    props.onClose();
  };

  const onCancel = () => {
    props.onClose();
    resetDrawer(true);
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
        return accumulator;
      })
      .catch((attachmentErrors) => {
        /*
         * Note! We want the first few uploads to succeed even if the last few
         * fail! Don't try to aggregate errors!
         */
        setFiles((oldFiles) =>
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
            { error: newError, file: attachment.file.get('name') },
          ],
        };
      });
  };

  /* Called after the ticket is successfully completed. */
  const attachFiles = (ticketId: number) => {
    const filesWithTarget: AttachmentWithTarget[] = files
      .filter((file) => !file.uploaded)
      .map((file, idx) => {
        setFiles((oldFiles) =>
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
      errors: [],
    });
  };

  const onSubmit = () => {
    const { onSuccess } = props;
    if (!['none', 'general'].includes(entityType) && !entityID) {
      setErrors([
        {
          field: 'input',
          reason: `Please select a ${entityIdToNameMap[entityType]}.`,
        },
      ]);
      return;
    }
    setErrors(undefined);
    setSubmitting(true);

    createSupportTicket({
      description,
      summary,
      [entityType]: Number(entityID),
    })
      .then((response) => {
        setErrors(undefined);
        setSubmitting(false);
        resetTicket();
        return response;
      })
      .then((response) => {
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
      .catch((errResponse) => {
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

  const requirementsMet = description.length > 0 && summary.length > 0;

  const hasErrorFor = getErrorMap(['summary', 'description', 'input'], errors);
  const summaryError = hasErrorFor.summary;
  const descriptionError = hasErrorFor.description;
  const generalError = hasErrorFor.none;
  const inputError = hasErrorFor.input;

  const entityError = Boolean(entities[entityIdToTypeMap[entityType]]?.error)
    ? `Error loading ${entityIdToNameMap[entityType]}s`
    : undefined;

  const hasNoEntitiesMessage = getHasNoEntitiesMessage();

  const topicOptions = [
    { label: 'General/Account/Billing', value: 'general' },
    ...renderEntityTypes(),
  ];

  const selectedTopic = topicOptions.find((eachTopic) => {
    return eachTopic.value === entityType;
  });

  const selectedEntity =
    data.find((thisEntity) => String(thisEntity.value) === entityID) || null;

  return (
    <Dialog
      open={open}
      onClose={close}
      fullHeight
      fullWidth
      title="Open a Support Ticket"
    >
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
          <TextField
            label="Title"
            placeholder="Enter a title for your ticket."
            required
            value={summary}
            onChange={handleSummaryInputChange}
            inputProps={{ maxLength: 64 }}
            errorText={summaryError}
            data-qa-ticket-summary
          />
          {props.hideProductSelection ? null : (
            <React.Fragment>
              <Select
                options={topicOptions}
                label="What is this regarding?"
                value={selectedTopic}
                onChange={handleEntityTypeChange}
                data-qa-ticket-entity-type
                isClearable={false}
              />
              {!['none', 'general'].includes(entityType) && (
                <>
                  <Select
                    options={data}
                    value={selectedEntity}
                    disabled={data.length === 0}
                    errorText={entityError || inputError}
                    placeholder={`Select a ${entityIdToNameMap[entityType]}`}
                    label={entityIdToNameMap[entityType] ?? 'Entity Select'}
                    onChange={handleEntityIDChange}
                    data-qa-ticket-entity-id
                    isLoading={entitiesLoading}
                    isClearable={false}
                  />
                  {hasNoEntitiesMessage && (
                    <FormHelperText>{hasNoEntitiesMessage}</FormHelperText>
                  )}
                </>
              )}
            </React.Fragment>
          )}
          <TabbedReply
            required
            error={descriptionError}
            handleChange={handleDescriptionInputChange}
            value={description}
            innerClass={classes.innerReply}
            rootClass={classes.rootReply}
            placeholder={
              "Tell us more about the trouble you're having and any steps you've already taken to resolve it."
            }
          />
          {/* <TicketAttachmentList attachments={attachments} /> */}
          <Accordion
            heading="Formatting Tips"
            detailProps={{ className: classes.expPanelSummary }}
          >
            <Reference rootClass={classes.reference} />
          </Accordion>
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
              data-testid="submit"
            >
              Open Ticket
            </Button>
            <Button
              onClick={onCancel}
              buttonType="secondary"
              className="cancel"
              data-qa-cancel
              data-testid="cancel"
            >
              Cancel
            </Button>
          </ActionsPanel>
        </React.Fragment>
      )}
    </Dialog>
  );
};

export default recompose<CombinedProps, Props>(SectionErrorBoundary)(
  SupportTicketDrawer
);
