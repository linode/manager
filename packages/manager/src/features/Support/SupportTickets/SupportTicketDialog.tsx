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
import { useCreateSupportTicketMutation } from 'src/queries/support';
import { storage } from 'src/utilities/storage';

import { MarkdownReference } from '../SupportTicketDetail/TabbedReply/MarkdownReference';
import { TabbedReply } from '../SupportTicketDetail/TabbedReply/TabbedReply';
import {
  ENTITY_ID_TO_NAME_MAP,
  SEVERITY_OPTIONS,
  SMTP_FIELD_NAME_TO_LABEL_MAP,
  TICKET_SEVERITY_TOOLTIP_TEXT,
  TICKET_TYPE_MAP,
  TICKET_TYPE_TO_CUSTOM_FIELD_KEYS_MAP,
} from './constants';
import { SupportTicketProductSelectionFields } from './SupportTicketProductSelectionFields';
import { SupportTicketSMTPFields } from './SupportTicketSMTPFields';
import { severityLabelMap, useTicketSeverityCapability } from './ticketUtils';

import type { FileAttachment } from '../index';
import type { AttachmentError } from '../SupportTicketDetail/SupportTicketDetail';
import type { SMTPCustomFields } from './SupportTicketSMTPFields';
import type { TicketSeverity } from '@linode/api-v4/lib/support';
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

export type AllSupportTicketFormFields = SupportTicketFormData &
  SMTPCustomFields;

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

export interface SupportTicketFormData {
  customFieldsByTicketType?: SMTPCustomFields;
  description: string;
  entityId: string;
  entityInputValue: string;
  entityType: EntityType;
  files: FileAttachment[];
  selectedSeverity: TicketSeverity | undefined;
  summary: string;
  ticketType: TicketType;
}

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

/**
 * formatDescription
 *
 * When variant ticketTypes include additional fields, fields must concat to one description string.
 * For readability, replace field names with field labels and format the description in Markdown.
 * @param values - the form payload, which can either be the general fields, or the general fields plus any custom fields
 * @param ticketType - either 'general' or a custom ticket type (e.g. 'smtp')
 *
 * @returns a description string containing custom fields in Markdown format
 */
export const formatDescription = (
  values: AllSupportTicketFormFields | SupportTicketFormData,
  ticketType: TicketType
) => {
  type customFieldTuple = [string, string | undefined];
  const customFields: customFieldTuple[] = Object.entries(
    values
  ).filter(([key, _value]: customFieldTuple) =>
    TICKET_TYPE_TO_CUSTOM_FIELD_KEYS_MAP[ticketType]?.includes(key)
  );

  // If there are no custom fields, just return the initial description.
  if (customFields.length === 0) {
    return values.description;
  }

  // Add all custom fields to the description in the ticket body, to be viewed on ticket details page and by Customer Support.
  return customFields
    .map(([key, value]) => {
      let label = key;
      if (ticketType === 'smtp') {
        label = SMTP_FIELD_NAME_TO_LABEL_MAP[key];
      }
      return `**${label}**\n${value ? value : 'No response'}`;
    })
    .join('\n\n');
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
    entityType,
    selectedSeverity,
    summary,
    ticketType,
  } = form.watch();

  const { mutateAsync: createSupportTicket } = useCreateSupportTicketMutation();

  const [submitting, setSubmitting] = React.useState<boolean>(false);

  const { classes } = useStyles();

  React.useEffect(() => {
    if (!open) {
      resetDrawer();
    }
  }, [open]);

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

  const onSubmit = form.handleSubmit(async (values) => {
    // console.log(form.getValues());
    // const { onSuccess } = props;
    const _description = formatDescription(values, ticketType);

    if (!['general', 'none'].includes(entityType) && !entityId) {
      form.setError('entityId', {
        message: `Please select a ${ENTITY_ID_TO_NAME_MAP[entityType]}.`,
      });

      return;
    }
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
        for (const error of errResponse) {
          if (error.field) {
            form.setError(error.field, { message: error.reason });
          } else {
            form.setError('root', { message: error.reason });
          }
        }

        setSubmitting(false);
        // scrollErrorIntoView();
      });
  });

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
                      options={SEVERITY_OPTIONS}
                      sx={{ maxWidth: 'initial' }}
                      value={selectedSeverityOption ?? null}
                    />
                  )}
                  control={form.control}
                  name="selectedSeverity"
                />
              )}
            </>
          )}
          {ticketType === 'smtp' ? (
            <SupportTicketSMTPFields />
          ) : (
            <>
              {props.hideProductSelection ? null : (
                <SupportTicketProductSelectionFields />
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
            </>
          )}
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
        </Dialog>
      </form>
    </FormProvider>
  );
};
