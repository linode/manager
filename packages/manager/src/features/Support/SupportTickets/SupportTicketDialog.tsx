import {
  createSupportTicket,
  uploadAttachment,
} from '@linode/api-v4/lib/support';
import { APIError } from '@linode/api-v4/lib/types';
import { Theme } from '@mui/material/styles';
import { update } from 'ramda';
import * as React from 'react';
import { debounce } from 'throttle-debounce';
import { makeStyles } from 'tss-react/mui';

import { Accordion } from 'src/components/Accordion';
import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Dialog } from 'src/components/Dialog/Dialog';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import { FormHelperText } from 'src/components/FormHelperText';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { EntityForTicketDetails } from 'src/components/SupportLink/SupportLink';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { useAccount } from 'src/queries/account';
import { useAllDatabasesQuery } from 'src/queries/databases';
import { useAllDomainsQuery } from 'src/queries/domains';
import { useAllFirewallsQuery } from 'src/queries/firewalls';
import { useAllKubernetesClustersQuery } from 'src/queries/kubernetes';
import { useAllLinodesQuery } from 'src/queries/linodes/linodes';
import { useAllNodeBalancersQuery } from 'src/queries/nodebalancers';
import { useAllVolumesQuery } from 'src/queries/volumes';
import {
  getAPIErrorOrDefault,
  getErrorMap,
  getErrorStringOrDefault,
} from 'src/utilities/errorUtils';
import { reduceAsync } from 'src/utilities/reduceAsync';
import { scrollErrorIntoView } from 'src/utilities/scrollErrorIntoView';
import { storage } from 'src/utilities/storage';

import { AttachFileForm } from '../AttachFileForm';
import { AttachmentError } from '../SupportTicketDetail/SupportTicketDetail';
import { MarkdownReference } from '../SupportTicketDetail/TabbedReply/MarkdownReference';
import { TabbedReply } from '../SupportTicketDetail/TabbedReply/TabbedReply';
import { FileAttachment } from '../index';
import SupportTicketSMTPFields, {
  fieldNameToLabelMap,
  smtpDialogTitle,
  smtpHelperText,
} from './SupportTicketSMTPFields';

const useStyles = makeStyles()((theme: Theme) => ({
  expPanelSummary: {
    backgroundColor: theme.name === 'dark' ? theme.bg.main : theme.bg.white,
    borderTop: `1px solid ${theme.bg.main}`,
    paddingTop: theme.spacing(1),
  },
  innerReply: {
    '& div[role="tablist"]': {
      marginBottom: theme.spacing(),
      marginTop: theme.spacing(),
    },
    padding: 0,
  },
  rootReply: {
    marginBottom: theme.spacing(2),
    padding: 0,
  },
}));

interface Accumulator {
  errors: AttachmentError[];
  success: string[];
}

interface AttachmentWithTarget {
  file: FormData;
  ticketId: number;
}

export type EntityType =
  | 'database_id'
  | 'domain_id'
  | 'firewall_id'
  | 'general'
  | 'linode_id'
  | 'lkecluster_id'
  | 'nodebalancer_id'
  | 'none'
  | 'volume_id';

export type TicketType = 'general' | 'smtp';

interface TicketTypeData {
  dialogTitle: string;
  helperText: JSX.Element | string;
}

export interface SupportTicketDialogProps {
  children?: React.ReactNode;
  hideProductSelection?: boolean;
  keepOpenOnSuccess?: boolean;
  onClose: () => void;
  onSuccess: (ticketId: number, attachmentErrors?: AttachmentError[]) => void;
  open: boolean;
  prefilledDescription?: string;
  prefilledEntity?: EntityForTicketDetails;
  prefilledTicketType?: TicketType;
  prefilledTitle?: string;
}

const ticketTypeMap: Record<TicketType, TicketTypeData> = {
  general: {
    dialogTitle: 'Open a Support Ticket',
    helperText: (
      <>
        {`We love our customers, and we\u{2019}re here to help if you need us.
        Please keep in mind that not all topics are within the scope of our support.
        For overall system status, please see `}
        <Link to="https://status.linode.com">status.linode.com</Link>.
      </>
    ),
  },
  smtp: {
    dialogTitle: smtpDialogTitle,
    helperText: smtpHelperText,
  },
};

const entityMap: Record<string, EntityType> = {
  Databases: 'database_id',
  Domains: 'domain_id',
  Firewalls: 'firewall_id',
  Kubernetes: 'lkecluster_id',
  Linodes: 'linode_id',
  NodeBalancers: 'nodebalancer_id',
  Volumes: 'volume_id',
};

const entityIdToNameMap: Record<EntityType, string> = {
  database_id: 'Database Cluster',
  domain_id: 'Domain',
  firewall_id: 'Firewall',
  general: '',
  linode_id: 'Linode',
  lkecluster_id: 'Kubernetes Cluster',
  nodebalancer_id: 'NodeBalancer',
  none: '',
  volume_id: 'Volume',
};

export const entitiesToItems = (type: string, entities: any) => {
  return entities.map((entity: any) => {
    return type === 'domain_id'
      ? // Domains don't have labels
        { label: entity.domain, value: entity.id }
      : { label: entity.label, value: entity.id };
  });
};

export const getInitialValue = (
  fromProps?: string,
  fromStorage?: string
): string => {
  return fromProps ?? fromStorage ?? '';
};

export const SupportTicketDialog = (props: SupportTicketDialogProps) => {
  const {
    open,
    prefilledDescription,
    prefilledEntity,
    prefilledTicketType,
    prefilledTitle,
  } = props;

  const { data: account } = useAccount({});

  const valuesFromStorage = storage.supportText.get();

  // Ticket information
  const [summary, setSummary] = React.useState<string>(
    getInitialValue(prefilledTitle, valuesFromStorage.title)
  );
  const [description, setDescription] = React.useState<string>(
    getInitialValue(prefilledDescription, valuesFromStorage.description)
  );
  const [entityType, setEntityType] = React.useState<EntityType>(
    prefilledEntity?.type ?? 'general'
  );
  const [entityID, setEntityID] = React.useState<string>(
    prefilledEntity ? String(prefilledEntity.id) : ''
  );
  const [ticketType, setTicketType] = React.useState<TicketType>(
    prefilledTicketType ?? 'general'
  );

  // SMTP ticket information
  const [smtpFields, setSMTPFields] = React.useState({
    companyName: '',
    customerName: account ? `${account?.first_name} ${account?.last_name}` : '',
    emailDomains: '',
    publicInfo: '',
    useCase: '',
  });

  const [files, setFiles] = React.useState<FileAttachment[]>([]);

  const [errors, setErrors] = React.useState<APIError[] | undefined>();
  const [submitting, setSubmitting] = React.useState<boolean>(false);

  const { classes } = useStyles();

  React.useEffect(() => {
    if (!open) {
      resetDrawer();
    }
  }, [open]);

  // React Query entities
  const {
    data: databases,
    error: databasesError,
    isLoading: databasesLoading,
  } = useAllDatabasesQuery(entityType === 'database_id');

  const {
    data: firewalls,
    error: firewallsError,
    isLoading: firewallsLoading,
  } = useAllFirewallsQuery(entityType === 'firewall_id');

  const {
    data: domains,
    error: domainsError,
    isLoading: domainsLoading,
  } = useAllDomainsQuery(entityType === 'domain_id');
  const {
    data: nodebalancers,
    error: nodebalancersError,
    isLoading: nodebalancersLoading,
  } = useAllNodeBalancersQuery(entityType === 'nodebalancer_id');

  const {
    data: clusters,
    error: clustersError,
    isLoading: clustersLoading,
  } = useAllKubernetesClustersQuery(entityType === 'lkecluster_id');

  const {
    data: linodes,
    error: linodesError,
    isLoading: linodesLoading,
  } = useAllLinodesQuery({}, {}, entityType === 'linode_id');

  const {
    data: volumes,
    error: volumesError,
    isLoading: volumesLoading,
  } = useAllVolumesQuery({}, {}, entityType === 'volume_id');

  const saveText = (_title: string, _description: string) => {
    storage.supportText.set({ description: _description, title: _title });
  };

  // Has to be a ref or else the timeout is redone with each render
  const debouncedSave = React.useRef(debounce(500, false, saveText)).current;

  React.useEffect(() => {
    // Store in-progress work to localStorage
    debouncedSave(summary, description);
  }, [summary, description]);

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
    setTicketType('general');
  };

  const resetDrawer = (clearValues: boolean = false) => {
    resetTicket(clearValues);
    setFiles([]);

    if (clearValues) {
      saveText('', '');
    }
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
  };

  const handleEntityIDChange = (selected: Item | null) => {
    setEntityID(String(selected?.value) ?? '');
  };

  const handleSMTPFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSMTPFields((smtpFields) => ({ ...smtpFields, [name]: value }));
  };

  /**
   * When variant ticketTypes include additional fields, fields must concat to one description string.
   * For readability, replace field names with field labels and format the description in Markdown.
   */
  const formatDescription = (fields: Record<string, string>) => {
    return Object.entries(fields)
      .map(
        ([key, value]) =>
          `**${fieldNameToLabelMap[key]}**\n${value ? value : 'No response'}`
      )
      .join('\n\n');
  };

  const close = () => {
    props.onClose();
    if (ticketType === 'smtp') {
      window.setTimeout(() => resetDrawer(true), 500);
    }
  };

  const onCancel = () => {
    props.onClose();
    window.setTimeout(() => resetDrawer(true), 500);
  };

  const updateFiles = (newFiles: FileAttachment[]) => {
    setFiles(newFiles);
  };

  /* Reducer passed into reduceAsync (previously Bluebird.reduce) below.
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
            { file: null, name: '', uploaded: true, uploading: false },
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
    return reduceAsync(filesWithTarget, attachFileReducer, {
      errors: [],
      success: [],
    });
  };

  const onSubmit = () => {
    const { onSuccess } = props;
    const _description =
      ticketType === 'smtp' ? formatDescription(smtpFields) : description;
    if (!['general', 'none'].includes(entityType) && !entityID) {
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
      description: _description,
      [entityType]: Number(entityID),
      summary,
    })
      .then((response) => {
        setErrors(undefined);
        setSubmitting(false);
        window.setTimeout(() => resetDrawer(true), 500);
        return response;
      })
      .then((response) => {
        attachFiles(response!.id).then(({ errors: _errors }: Accumulator) => {
          if (!props.keepOpenOnSuccess) {
            close();
          }
          /* Errors will be an array of errors, or empty if all attachments succeeded. */
          onSuccess(response!.id, _errors);
        });
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

  const smtpRequirementsMet =
    smtpFields.customerName.length > 0 &&
    smtpFields.useCase.length > 0 &&
    smtpFields.emailDomains.length > 0 &&
    smtpFields.publicInfo.length > 0;
  const requirementsMet =
    summary.length > 0 &&
    (ticketType === 'smtp' ? smtpRequirementsMet : description.length > 0);

  const hasErrorFor = getErrorMap(['summary', 'description', 'input'], errors);
  const summaryError = hasErrorFor.summary;
  const descriptionError = hasErrorFor.description;
  const generalError = hasErrorFor.none;
  const inputError = hasErrorFor.input;

  const topicOptions = [
    { label: 'General/Account/Billing', value: 'general' },
    ...renderEntityTypes(),
  ];

  const selectedTopic = topicOptions.find((eachTopic) => {
    return eachTopic.value === entityType;
  });

  const getEntityOptions = (): Item<any, string>[] => {
    const reactQueryEntityDataMap = {
      database_id: databases,
      domain_id: domains,
      firewall_id: firewalls,
      linode_id: linodes,
      lkecluster_id: clusters,
      nodebalancer_id: nodebalancers,
      volume_id: volumes,
    };

    if (!reactQueryEntityDataMap[entityType]) {
      return [];
    }

    // domain's don't have a label so we map the domain as the label
    if (entityType === 'domain_id') {
      return (
        reactQueryEntityDataMap[entityType]?.map(({ domain, id }) => ({
          label: domain,
          value: id,
        })) || []
      );
    }

    return (
      reactQueryEntityDataMap[entityType]?.map(
        ({ id, label }: { id: number; label: string }) => ({
          label,
          value: id,
        })
      ) || []
    );
  };

  const loadingMap: Record<EntityType, boolean> = {
    database_id: databasesLoading,
    domain_id: domainsLoading,
    firewall_id: firewallsLoading,
    general: false,
    linode_id: linodesLoading,
    lkecluster_id: clustersLoading,
    nodebalancer_id: nodebalancersLoading,
    none: false,
    volume_id: volumesLoading,
  };

  const errorMap: Record<EntityType, APIError[] | null> = {
    database_id: databasesError,
    domain_id: domainsError,
    firewall_id: firewallsError,
    general: null,
    linode_id: linodesError,
    lkecluster_id: clustersError,
    nodebalancer_id: nodebalancersError,
    none: null,
    volume_id: volumesError,
  };

  const entityOptions = getEntityOptions();
  const areEntitiesLoading = loadingMap[entityType];
  const entityError = Boolean(errorMap[entityType])
    ? `Error loading ${entityIdToNameMap[entityType]}s`
    : undefined;

  const selectedEntity =
    entityOptions.find((thisEntity) => String(thisEntity.value) === entityID) ||
    null;

  return (
    <Dialog
      fullHeight
      fullWidth
      onClose={close}
      open={open}
      title={ticketTypeMap[ticketType].dialogTitle}
    >
      {props.children || (
        <React.Fragment>
          {generalError && (
            <Notice data-qa-notice text={generalError} variant="error" />
          )}

          <Typography data-qa-support-ticket-helper-text>
            {ticketTypeMap[ticketType].helperText}
          </Typography>
          <TextField
            data-qa-ticket-summary
            errorText={summaryError}
            inputProps={{ maxLength: 64 }}
            label="Title"
            onChange={handleSummaryInputChange}
            placeholder="Enter a title for your ticket."
            required
            value={summary}
          />
          {ticketType === 'smtp' ? (
            <SupportTicketSMTPFields
              formState={smtpFields}
              handleChange={handleSMTPFieldChange}
            />
          ) : (
            <React.Fragment>
              {props.hideProductSelection ? null : (
                <React.Fragment>
                  <Select
                    data-qa-ticket-entity-type
                    isClearable={false}
                    label="What is this regarding?"
                    onChange={handleEntityTypeChange}
                    options={topicOptions}
                    value={selectedTopic}
                  />
                  {!['general', 'none'].includes(entityType) && (
                    <>
                      <Select
                        data-qa-ticket-entity-id
                        disabled={entityOptions.length === 0}
                        errorText={entityError || inputError}
                        isClearable={false}
                        isLoading={areEntitiesLoading}
                        label={entityIdToNameMap[entityType] ?? 'Entity Select'}
                        onChange={handleEntityIDChange}
                        options={entityOptions}
                        placeholder={`Select a ${entityIdToNameMap[entityType]}`}
                        value={selectedEntity}
                      />
                      {!areEntitiesLoading && entityOptions.length === 0 ? (
                        <FormHelperText>
                          You don&rsquo;t have any{' '}
                          {entityIdToNameMap[entityType]}s on your account.
                        </FormHelperText>
                      ) : null}
                    </>
                  )}
                </React.Fragment>
              )}
              <TabbedReply
                placeholder={
                  "Tell us more about the trouble you're having and any steps you've already taken to resolve it."
                }
                error={descriptionError}
                handleChange={handleDescriptionInputChange}
                innerClass={classes.innerReply}
                required
                rootClass={classes.rootReply}
                value={description}
              />
              <Accordion
                detailProps={{ className: classes.expPanelSummary }}
                heading="Formatting Tips"
              >
                <MarkdownReference />
              </Accordion>
              <AttachFileForm files={files} updateFiles={updateFiles} />
            </React.Fragment>
          )}
          <ActionsPanel
            primaryButtonProps={{
              'data-testid': 'submit',
              disabled: !requirementsMet,
              label: 'Open Ticket',
              loading: submitting,
              onClick: onSubmit,
            }}
            secondaryButtonProps={{
              'data-testid': 'cancel',
              label: 'Cancel',
              onClick: onCancel,
            }}
            sx={{ display: 'flex', justifyContent: 'flex-end' }}
          />
        </React.Fragment>
      )}
    </Dialog>
  );
};
