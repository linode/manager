import { FormHelperText } from '@mui/material';
import * as React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { debounce } from 'throttle-debounce';
import { makeStyles } from 'tss-react/mui';

import { Accordion } from 'src/components/Accordion';
import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Dialog } from 'src/components/Dialog/Dialog';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { useAllDatabasesQuery } from 'src/queries/databases/databases';
import { useAllDomainsQuery } from 'src/queries/domains';
import { useAllFirewallsQuery } from 'src/queries/firewalls';
import { useAllKubernetesClustersQuery } from 'src/queries/kubernetes';
import { useAllLinodesQuery } from 'src/queries/linodes/linodes';
import { useAllNodeBalancersQuery } from 'src/queries/nodebalancers';
import { useCreateSupportTicketMutation } from 'src/queries/support';
import { useAllVolumesQuery } from 'src/queries/volumes/volumes';
import { storage } from 'src/utilities/storage';

import { MarkdownReference } from '../SupportTicketDetail/TabbedReply/MarkdownReference';
import { TabbedReply } from '../SupportTicketDetail/TabbedReply/TabbedReply';
import {
  ENTITY_ID_TO_NAME_MAP,
  ENTITY_MAP,
  TICKET_SEVERITY_TOOLTIP_TEXT,
  TICKET_TYPE_MAP,
} from './constants';
import { severityLabelMap, useTicketSeverityCapability } from './ticketUtils';

import type { FileAttachment } from '../index';
import type { AttachmentError } from '../SupportTicketDetail/SupportTicketDetail';
import type { TicketSeverity } from '@linode/api-v4/lib/support';
import type { APIError } from '@linode/api-v4/lib/types';
import type { Theme } from '@mui/material/styles';
import type { EntityForTicketDetails } from 'src/components/SupportLink/SupportLink';

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

// TODO:
// interface Accumulator {
//   errors: AttachmentError[];
//   success: string[];
// }

// interface AttachmentWithTarget {
//   file: FormData;
//   ticketId: number;
// }

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

export interface TicketTypeData {
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

const severityOptions: {
  label: string;
  value: TicketSeverity;
}[] = Array.from(severityLabelMap).map(([severity, label]) => ({
  label,
  value: severity,
}));

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

  const hasSeverityCapability = useTicketSeverityCapability();

  interface SupportTicketFormData {
    description: string;
    entityId: string;
    entityInputValue: string;
    entityType: EntityType;
    files: FileAttachment[];
    selectedSeverity: TicketSeverity | undefined;
    summary: string;
    ticketType: TicketType;
  }

  const valuesFromStorage = storage.supportText.get();

  // Ticket information
  const form = useForm<SupportTicketFormData>({
    defaultValues: {
      description: getInitialValue(
        prefilledDescription,
        valuesFromStorage.description
      ),
      entityId: prefilledEntity ? String(prefilledEntity.id) : '',
      entityInputValue: '',
      entityType: prefilledEntity?.type ?? 'general',
      files: [],
      summary: getInitialValue(prefilledTitle, valuesFromStorage.title),
      ticketType: prefilledTicketType ?? 'general',
    },
  });

  const {
    description,
    entityId,
    entityInputValue,
    entityType,
    selectedSeverity,
    summary,
    ticketType,
  } = form.getValues();

  const { mutateAsync: createSupportTicket } = useCreateSupportTicketMutation();

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
  } = useAllDatabasesQuery(prefilledEntity?.type === 'database_id');

  const {
    data: firewalls,
    error: firewallsError,
    isLoading: firewallsLoading,
  } = useAllFirewallsQuery(prefilledEntity?.type === 'firewall_id');

  const {
    data: domains,
    error: domainsError,
    isLoading: domainsLoading,
  } = useAllDomainsQuery(prefilledEntity?.type === 'domain_id');

  const {
    data: nodebalancers,
    error: nodebalancersError,
    isLoading: nodebalancersLoading,
  } = useAllNodeBalancersQuery(prefilledEntity?.type === 'nodebalancer_id');

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
    // TODO: handle the prefilled from props/local storage case.
    form.reset();
  };

  const resetDrawer = (clearValues: boolean = false) => {
    resetTicket(clearValues);

    if (clearValues) {
      saveText('', '');
    }
  };

  /**
   * When variant ticketTypes include additional fields, fields must concat to one description string.
   * For readability, replace field names with field labels and format the description in Markdown.
   */
  // const formatDescription = (fields: Record<string, string>) => {
  //   return Object.entries(fields)
  //     .map(
  //       ([key, value]) =>
  //         `**${SMTP_FIELD_NAME_TO_LABEL_MAP[key]}**\n${
  //           value ? value : 'No response'
  //         }`
  //     )
  //     .join('\n\n');
  // };

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

  const onSubmit = () => {
    // console.log(form.getValues());
    // const { onSuccess } = props;
    const _description = description;
    // ticketType === 'smtp' ? formatDescription(smtpFields) : description;
    // if (!['general', 'none'].includes(entityType) && !entityId) {
    //   setErrors([
    //     {
    //       field: 'input',
    //       reason: `Please select a ${entityIdToNameMap[entityType]}.`,
    //     },
    //   ]);
    //   return;
    // }
    // setErrors(undefined);
    setSubmitting(true);
    createSupportTicket({
      description: _description,
      [entityType]: Number(entityId),
      severity: selectedSeverity,
      summary,
    })
      .then((response) => {
        setSubmitting(false);
        window.setTimeout(() => resetDrawer(true), 500);
        return response;
      })
      .then((response) => {
        // TODO: handle file uploading
        if (!props.keepOpenOnSuccess) {
          close();
        }
      })
      .catch((errResponse) => {
        /* This block will only handle errors in creating the actual ticket; attachment
         * errors are handled above. */
        // TODO: need schema
        // for (const error of errResponse) {
        //   if (error.field) {
        //     form.setError(error.field, { message: error.reason });
        //   } else {
        //     form.setError('root', { message: error.reason });
        //   }
        // }

        setSubmitting(false);
        // scrollErrorIntoView();
      });
  };

  const renderEntityTypes = () => {
    return Object.keys(ENTITY_MAP).map((key: string) => {
      return { label: key, value: ENTITY_MAP[key] };
    });
  };

  const topicOptions: { label: string; value: EntityType }[] = [
    { label: 'General/Account/Billing', value: 'general' },
    ...renderEntityTypes(),
  ];

  const selectedTopic = topicOptions.find((eachTopic) => {
    return eachTopic.value === entityType;
  });

  const getEntityOptions = (): { label: string; value: number }[] => {
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

    // Domains don't have a label so we map the domain as the label
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
    ? `Error loading ${ENTITY_ID_TO_NAME_MAP[entityType]}s`
    : undefined;

  const selectedEntity =
    entityOptions.find((thisEntity) => String(thisEntity.value) === entityId) ||
    null;

  const selectedSeverityLabel =
    selectedSeverity && severityLabelMap.get(selectedSeverity);
  const selectedSeverityOption =
    selectedSeverity != undefined && selectedSeverityLabel != undefined
      ? {
          label: selectedSeverityLabel,
          value: selectedSeverity,
        }
      : undefined;

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit}>
        <Dialog
          fullHeight
          fullWidth
          onClose={close}
          open={open}
          title={TICKET_TYPE_MAP[ticketType].dialogTitle}
        >
          {props.children || (
            <>
              {form.formState.errors.root && (
                <Notice
                  data-qa-notice
                  text={form.formState.errors.root.message}
                  variant="error"
                />
              )}

              <Typography data-qa-support-ticket-helper-text>
                {TICKET_TYPE_MAP[ticketType].helperText}
              </Typography>
              <Controller
                render={({ field, fieldState }) => (
                  <TextField
                    data-qa-ticket-summary
                    errorText={fieldState.error?.message}
                    inputProps={{ maxLength: 64 }}
                    label="Title"
                    onChange={field.onChange}
                    placeholder="Enter a title for your ticket."
                    required
                    value={summary}
                  />
                )}
                control={form.control}
                name="summary"
              />
              {hasSeverityCapability && (
                <Controller
                  render={({ field }) => (
                    <Autocomplete
                      onChange={(e, severity) =>
                        field.onChange(
                          severity != null ? severity.value : undefined
                        )
                      }
                      textFieldProps={{
                        tooltipPosition: 'right',
                        tooltipText: TICKET_SEVERITY_TOOLTIP_TEXT,
                      }}
                      autoHighlight
                      data-qa-ticket-severity
                      label="Severity"
                      options={severityOptions}
                      sx={{ maxWidth: 'initial' }}
                      value={selectedSeverityOption ?? null}
                    />
                  )}
                  control={form.control}
                  name="selectedSeverity"
                />
              )}
              {props.hideProductSelection ? null : (
                <>
                  <Controller
                    render={({ field }) => (
                      <Autocomplete
                        data-qa-ticket-entity-type
                        disableClearable
                        label="What is this regarding?"
                        onChange={(_e, type) => field.onChange(type.value)}
                        options={topicOptions}
                        value={selectedTopic}
                      />
                    )}
                    control={form.control}
                    name="entityType"
                  />
                  {!['general', 'none'].includes(entityType) && (
                    <>
                      <Controller
                        render={({ field, fieldState }) => (
                          <Autocomplete
                            label={
                              ENTITY_ID_TO_NAME_MAP[entityType] ??
                              'Entity Select'
                            }
                            onChange={(e, id) =>
                              field.onChange(id ? String(id?.value) : '')
                            }
                            data-qa-ticket-entity-id
                            disabled={entityOptions.length === 0}
                            errorText={entityError || fieldState.error?.message}
                            inputValue={entityInputValue}
                            loading={areEntitiesLoading}
                            onInputChange={(e, value) => field.onChange(value)}
                            options={entityOptions}
                            placeholder={`Select a ${ENTITY_ID_TO_NAME_MAP[entityType]}`}
                            value={selectedEntity}
                          />
                        )}
                        control={form.control}
                        name="entityId"
                      />
                      {!areEntitiesLoading && entityOptions.length === 0 ? (
                        <FormHelperText>
                          You don&rsquo;t have any{' '}
                          {ENTITY_ID_TO_NAME_MAP[entityType]}s on your account.
                        </FormHelperText>
                      ) : null}
                    </>
                  )}
                </>
              )}
              <Controller
                render={({ field, fieldState }) => (
                  <TabbedReply
                    placeholder={
                      "Tell us more about the trouble you're having and any steps you've already taken to resolve it."
                    }
                    error={fieldState.error?.message}
                    handleChange={field.onChange}
                    innerClass={classes.innerReply}
                    required
                    rootClass={classes.rootReply}
                    value={description}
                  />
                )}
                control={form.control}
                name="description"
              />
              <Accordion
                detailProps={{ className: classes.expPanelSummary }}
                heading="Formatting Tips"
              >
                <MarkdownReference />
              </Accordion>
              {/* <AttachFileForm files={files} updateFiles={updateFiles} /> */}
              <ActionsPanel
                primaryButtonProps={{
                  'data-testid': 'submit',
                  //   disabled: !requirementsMet,
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
            </>
          )}
        </Dialog>
      </form>
    </FormProvider>
  );
};
