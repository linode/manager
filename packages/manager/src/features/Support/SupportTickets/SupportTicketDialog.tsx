import { yupResolver } from '@hookform/resolvers/yup';
import { uploadAttachment } from '@linode/api-v4/lib/support';
import { useCreateSupportTicketMutation } from '@linode/queries';
import {
  Accordion,
  ActionsPanel,
  Autocomplete,
  Box,
  Dialog,
  Notice,
  TextField,
  Typography,
} from '@linode/ui';
import { reduceAsync, scrollErrorIntoViewV2 } from '@linode/utilities';
import { useSearch } from '@tanstack/react-router';
import { update } from 'ramda';
import * as React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useLocation } from 'react-router-dom';
import { debounce } from 'throttle-debounce';

import { sendSupportTicketExitEvent } from 'src/utilities/analytics/customEventAnalytics';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import { storage, supportTicketStorageDefaults } from 'src/utilities/storage';

import { AttachFileForm } from '../AttachFileForm';
import { MarkdownReference } from '../SupportTicketDetail/TabbedReply/MarkdownReference';
import { TabbedReply } from '../SupportTicketDetail/TabbedReply/TabbedReply';
import {
  ENTITY_ID_TO_NAME_MAP,
  SCHEMA_MAP,
  SEVERITY_LABEL_MAP,
  SEVERITY_OPTIONS,
  TICKET_SEVERITY_TOOLTIP_TEXT,
  TICKET_TYPE_MAP,
} from './constants';
import { SupportTicketAccountLimitFields } from './SupportTicketAccountLimitFields';
import { SupportTicketProductSelectionFields } from './SupportTicketProductSelectionFields';
import { SupportTicketSMTPFields } from './SupportTicketSMTPFields';
import { formatDescription, useTicketSeverityCapability } from './ticketUtils';

import type { FileAttachment } from '../index';
import type { AttachmentError } from '../SupportTicketDetail/SupportTicketDetail';
import type { AccountLimitCustomFields } from './SupportTicketAccountLimitFields';
import type { SMTPCustomFields } from './SupportTicketSMTPFields';
import type {
  CreateKubeClusterPayload,
  CreateLinodeRequest,
  TicketSeverity,
} from '@linode/api-v4';
import type { EntityForTicketDetails } from 'src/components/SupportLink/SupportLink';

interface Accumulator {
  errors: AttachmentError[];
  success: string[];
}

interface AttachmentWithTarget {
  file: FormData;
  ticketId: number;
}

export type EntityType =
  | 'bucket'
  | 'database_id'
  | 'domain_id'
  | 'firewall_id'
  | 'general'
  | 'linode_id'
  | 'lkecluster_id'
  | 'nodebalancer_id'
  | 'none'
  | 'volume_id'
  | 'vpc_id';

export type TicketType = 'accountLimit' | 'general' | 'smtp';

export type AllSupportTicketFormFields = SupportTicketFormFields &
  SMTPCustomFields &
  AccountLimitCustomFields;

export type FormPayloadValues =
  | Partial<CreateKubeClusterPayload>
  | Partial<CreateLinodeRequest>;

export interface TicketTypeData {
  dialogTitle: string;
  helperText: JSX.Element | string;
  ticketTitle?: string;
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

export interface SupportTicketFormFields {
  description: string;
  entityId: string;
  entityInputValue: string;
  entityType: EntityType;
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

export const SupportTicketDialog = (props: SupportTicketDialogProps) => {
  const {
    open,
    prefilledDescription,
    prefilledEntity,
    prefilledTicketType,
    prefilledTitle,
  } = props;

  const { dialogTitle = '' } = useSearch({
    strict: false,
  });

  const location = useLocation<any>();
  const stateParams = location.state;

  // Collect prefilled data from props or Link parameters.
  const _prefilledDescription: string =
    prefilledDescription ?? stateParams?.description ?? undefined;
  const _prefilledEntity: EntityForTicketDetails =
    prefilledEntity ?? stateParams?.entity ?? undefined;
  const _prefilledTitle: string = prefilledTitle ?? dialogTitle ?? undefined;
  const prefilledFormPayloadValues: FormPayloadValues =
    stateParams?.formPayloadValues ?? undefined;
  const _prefilledTicketType: TicketType =
    prefilledTicketType ?? stateParams?.ticketType ?? undefined;

  // Use the prefilled title if one is given, otherwise, use any default prefill titles by ticket type, if extant.
  const newPrefilledTitle = _prefilledTitle
    ? _prefilledTitle
    : _prefilledTicketType && TICKET_TYPE_MAP[_prefilledTicketType]
      ? TICKET_TYPE_MAP[_prefilledTicketType].ticketTitle
      : undefined;

  const formContainerRef = React.useRef<HTMLFormElement>(null);

  const hasSeverityCapability = useTicketSeverityCapability();

  const valuesFromStorage = storage.supportTicket.get();

  // Ticket information
  const form = useForm<SupportTicketFormFields>({
    defaultValues: {
      description: getInitialValue(
        _prefilledDescription,
        valuesFromStorage.description
      ),
      entityId: _prefilledEntity?.id ? String(_prefilledEntity.id) : '',
      entityInputValue: '',
      entityType: _prefilledEntity?.type ?? 'general',
      summary: getInitialValue(newPrefilledTitle, valuesFromStorage.summary),
      ticketType: _prefilledTicketType ?? 'general',
    },
    resolver: yupResolver(SCHEMA_MAP[_prefilledTicketType ?? 'general']),
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

  const [files, setFiles] = React.useState<FileAttachment[]>([]);

  const [submitting, setSubmitting] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (!open) {
      resetDrawer();
    }
  }, [open]);

  /**
   * Store 'general' support ticket data in local storage if it exists.
   * Specific fields from other ticket types (e.g. smtp) will not be saved since the general form will render via 'Open New Ticket'.
   */
  const saveFormData = (values: SupportTicketFormFields) => {
    storage.supportTicket.set(values);
  };

  // Has to be a ref or else the timeout is redone with each render
  const debouncedSave = React.useRef(
    debounce(500, false, saveFormData)
  ).current;

  React.useEffect(() => {
    // Store in-progress work to localStorage
    debouncedSave(form.getValues());
  }, [summary, description, entityId, entityType, selectedSeverity]);

  /**
   * Clear the drawer completely if clearValues is passed (when canceling out of the drawer or successfully submitting)
   * or reset to the default values (from localStorage) otherwise.
   */
  const resetTicket = (clearValues: boolean = false) => {
    form.reset({
      ...form.formState.defaultValues,
      description: clearValues ? '' : valuesFromStorage.description,
      entityId: clearValues ? '' : valuesFromStorage.entityId,
      entityInputValue: clearValues ? '' : valuesFromStorage.entityInputValue,
      entityType: clearValues ? 'general' : valuesFromStorage.entityType,
      selectedSeverity: clearValues
        ? undefined
        : valuesFromStorage.selectedSeverity,
      summary: clearValues ? '' : valuesFromStorage.summary,
      ticketType: 'general',
    });
  };

  const resetDrawer = (clearValues: boolean = false) => {
    resetTicket(clearValues);
    setFiles([]);

    if (clearValues) {
      saveFormData(supportTicketStorageDefaults);
    }
  };

  const handleClose = () => {
    if (ticketType !== 'general') {
      window.setTimeout(() => resetDrawer(true), 500);
    }
    props.onClose();
    sendSupportTicketExitEvent('Close');
  };

  const handleCancel = () => {
    props.onClose();
    window.setTimeout(() => resetDrawer(true), 500);
    sendSupportTicketExitEvent('Cancel');
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

  const handleSubmit = form.handleSubmit(async (values) => {
    const { onSuccess } = props;

    const _description = formatDescription(values, ticketType);

    // If this is an account limit ticket, we needed the entity type but won't actually send a valid entity selection.
    // Reset the entity type and id back to defaults.
    const _entityType =
      ticketType === 'accountLimit' ? 'general' : values.entityType;
    const _entityId = ticketType === 'accountLimit' ? '' : values.entityId;

    if (!['general', 'none'].includes(_entityType) && !_entityId) {
      form.setError('entityId', {
        message: `Please select a ${ENTITY_ID_TO_NAME_MAP[entityType]}.`,
      });

      return;
    }
    setSubmitting(true);

    const baseRequestPayload = {
      description: _description,
      severity: selectedSeverity,
      summary,
    };

    let requestPayload;
    if (entityType === 'bucket') {
      const bucketLabel = values.entityInputValue;
      requestPayload = {
        bucket: bucketLabel,
        region: _entityId,
        ...baseRequestPayload,
      };
    } else {
      requestPayload = {
        [_entityType]: Number(_entityId),
        ...baseRequestPayload,
      };
    }

    createSupportTicket(requestPayload)
      .then((response) => {
        return response;
      })
      .then((response) => {
        attachFiles(response!.id).then(({ errors: _errors }: Accumulator) => {
          setSubmitting(false);
          if (!props.keepOpenOnSuccess) {
            window.setTimeout(() => resetDrawer(true), 500);
            props.onClose();
          }
          /* Errors will be an array of errors, or empty if all attachments succeeded. */
          onSuccess(response!.id, _errors);
        });
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
        scrollErrorIntoViewV2(formContainerRef);
      });
  });

  const selectedSeverityLabel =
    selectedSeverity && SEVERITY_LABEL_MAP.get(selectedSeverity);
  const selectedSeverityOption =
    selectedSeverity !== undefined && selectedSeverityLabel !== undefined
      ? {
          label: selectedSeverityLabel,
          value: selectedSeverity,
        }
      : undefined;

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit} ref={formContainerRef}>
        <Dialog
          fullHeight
          fullWidth
          onClose={handleClose}
          open={open}
          title={TICKET_TYPE_MAP[ticketType].dialogTitle}
        >
          {props.children || (
            <>
              <Typography data-qa-support-ticket-helper-text>
                {TICKET_TYPE_MAP[ticketType].helperText}
              </Typography>
              <Controller
                control={form.control}
                name="summary"
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
              />
              {hasSeverityCapability && (
                <Controller
                  control={form.control}
                  name="selectedSeverity"
                  render={({ field }) => (
                    <Autocomplete
                      autoHighlight
                      data-qa-ticket-severity
                      label="Severity"
                      onChange={(e, severity) =>
                        field.onChange(
                          severity !== null ? severity.value : undefined
                        )
                      }
                      options={SEVERITY_OPTIONS}
                      sx={{ maxWidth: 'initial' }}
                      textFieldProps={{
                        tooltipPosition: 'right',
                        tooltipText: TICKET_SEVERITY_TOOLTIP_TEXT,
                      }}
                      value={selectedSeverityOption ?? null}
                    />
                  )}
                />
              )}
            </>
          )}
          {ticketType === 'smtp' && <SupportTicketSMTPFields />}
          {ticketType === 'accountLimit' && (
            <SupportTicketAccountLimitFields
              prefilledFormPayloadValues={prefilledFormPayloadValues}
            />
          )}
          {(!ticketType || ticketType === 'general') && (
            <>
              {props.hideProductSelection ? null : (
                <SupportTicketProductSelectionFields />
              )}
              <Box mt={1}>
                <Controller
                  control={form.control}
                  name="description"
                  render={({ field, fieldState }) => (
                    <TabbedReply
                      error={fieldState.error?.message}
                      handleChange={field.onChange}
                      placeholder={
                        'Tell us more about the trouble you’re having and any steps you’ve already taken to resolve it.'
                      }
                      required
                      value={description}
                    />
                  )}
                />
              </Box>
              <Accordion
                detailProps={{ sx: { p: 0.25 } }}
                heading="Formatting Tips"
                summaryProps={{ sx: { paddingX: 0.25 } }}
                sx={(theme) => ({ mt: `${theme.spacing(0.5)} !important` })} // forcefully disable margin when accordion is expanded
              >
                <MarkdownReference />
              </Accordion>
              <AttachFileForm files={files} updateFiles={updateFiles} />
              {form.formState.errors.root && (
                <Notice
                  data-qa-notice
                  spacingTop={16}
                  text={form.formState.errors.root.message}
                  variant="error"
                />
              )}
            </>
          )}
          <ActionsPanel
            primaryButtonProps={{
              'data-testid': 'submit',
              label: 'Open Ticket',
              loading: submitting,
              onClick: handleSubmit,
            }}
            secondaryButtonProps={{
              'data-testid': 'cancel',
              label: 'Cancel',
              onClick: handleCancel,
            }}
            sx={{ display: 'flex', justifyContent: 'flex-end' }}
          />
        </Dialog>
      </form>
    </FormProvider>
  );
};
