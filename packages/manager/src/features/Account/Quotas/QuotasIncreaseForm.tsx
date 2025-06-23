import { yupResolver } from '@hookform/resolvers/yup';
import { useCreateSupportTicketMutation, useProfile } from '@linode/queries';
import { InputAdornment, Select } from '@linode/ui';
import {
  Accordion,
  ActionsPanel,
  Notice,
  Stack,
  TextField,
  Typography,
} from '@linode/ui';
import { scrollErrorIntoViewV2 } from '@linode/utilities';
import * as React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';

import { Markdown } from 'src/components/Markdown/Markdown';

import { getQuotaIncreaseFormSchema, getQuotaIncreaseMessage } from './utils';

import type { APIError, Quota, QuotaType, TicketRequest } from '@linode/api-v4';
import type { SelectOption } from '@linode/ui';

interface QuotasIncreaseFormProps {
  convertedResourceMetrics: {
    limit: number;
    metric: string;
  };
  onClose: () => void;
  onSuccess: (ticketId: number) => void;
  open: boolean;
  quota: Quota;
  selectedService: SelectOption<QuotaType>;
}

export interface QuotaIncreaseFormFields extends TicketRequest {
  neededIn: string;
  notes: string;
  quantity: string;
}

export const QuotasIncreaseForm = (props: QuotasIncreaseFormProps) => {
  const { onClose, quota, convertedResourceMetrics, selectedService } = props;
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [error, setError] = React.useState<null | string>(null);
  const formContainerRef = React.useRef<HTMLFormElement>(null);
  const { data: profile } = useProfile();
  const { mutateAsync: createSupportTicket } = useCreateSupportTicketMutation();

  const defaultValues = React.useMemo(
    () =>
      getQuotaIncreaseMessage({
        convertedMetrics: convertedResourceMetrics,
        neededIn: 'Fewer than 7 days',
        profile,
        quantity: convertedResourceMetrics?.limit ?? 0,
        quota,
        selectedService,
      }),
    [quota, profile, selectedService, convertedResourceMetrics]
  );
  const form = useForm<QuotaIncreaseFormFields>({
    defaultValues,
    mode: 'onBlur',
    resolver: yupResolver(
      getQuotaIncreaseFormSchema(convertedResourceMetrics?.limit ?? 0)
    ),
  });

  const { notes, quantity, summary, neededIn } = form.watch();

  const quotaIncreaseDescription = getQuotaIncreaseMessage({
    convertedMetrics: convertedResourceMetrics,
    neededIn,
    profile,
    quantity: Number(quantity),
    quota,
    selectedService,
  }).description;

  const handleSubmit = form.handleSubmit(async (values) => {
    const { onSuccess } = props;

    setSubmitting(true);

    const payload: TicketRequest = {
      description: `${quotaIncreaseDescription}\n\n${values.notes}`,
      summary: values.summary,
    };

    createSupportTicket(payload)
      .then((response) => {
        return response;
      })
      .then((response) => {
        onSuccess(response.id);
      })
      .catch((errResponse: APIError[]) => {
        setError(errResponse[0].reason);
        setSubmitting(false);
        scrollErrorIntoViewV2(formContainerRef);
      });
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit} ref={formContainerRef}>
        {error && <Notice variant="error">{error}</Notice>}
        <Stack direction="column" gap={2}>
          <Controller
            control={form.control}
            name="summary"
            render={({ field, fieldState }) => (
              <TextField
                errorText={fieldState.error?.message}
                label="Title"
                name="summary"
                onChange={(e) => {
                  field.onChange(e);
                }}
                placeholder="Enter a title for your ticket."
                required
                value={field.value}
              />
            )}
          />
          <Controller
            control={form.control}
            name="quantity"
            render={({ field, fieldState }) => (
              <Stack direction="row" gap={2}>
                <TextField
                  errorText={fieldState.error?.message}
                  helperText={`Current quota in ${quota.region_applied || quota.s3_endpoint}: ${convertedResourceMetrics?.limit?.toLocaleString() ?? 'unknown'} ${convertedResourceMetrics?.metric}`}
                  label="New Quota"
                  min={convertedResourceMetrics?.limit}
                  name="quantity"
                  onChange={(e) => {
                    field.onChange(e);
                    form.trigger('quantity');
                  }}
                  required
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <Typography
                            component="span"
                            sx={(theme) => ({
                              color: theme.tokens.alias.Content.Text,
                              font: theme.font.bold,
                              fontSize: theme.tokens.font.FontSize.Xxxs,
                              textTransform: 'uppercase',
                              userSelect: 'none',
                              whiteSpace: 'nowrap',
                            })}
                          >
                            {convertedResourceMetrics?.metric ??
                              quota.resource_metric}
                          </Typography>
                        </InputAdornment>
                      ),
                    },
                  }}
                  type="number"
                  value={field.value}
                />
              </Stack>
            )}
          />
          <Controller
            control={form.control}
            name="neededIn"
            render={({ field, fieldState }) => (
              <Select
                errorText={fieldState.error?.message}
                label="Needed in"
                onChange={(_event, value) => {
                  field.onChange(value.value);
                }}
                options={[
                  {
                    label: 'Fewer than 7 days',
                    value: 'Fewer than 7 days',
                  },
                  {
                    label: '7 to 30 days',
                    value: '7 to 30 days',
                  },
                  {
                    label: 'More than 30 days',
                    value: 'More than 30 days',
                  },
                ]}
                required
                value={{
                  label: field.value,
                  value: field.value,
                }}
              />
            )}
          />
          <Controller
            control={form.control}
            name="notes"
            render={({ field, fieldState }) => (
              <TextField
                errorText={fieldState.error?.message}
                label="Description"
                multiline
                name="notes"
                onChange={(e) => {
                  field.onChange(e);
                }}
                placeholder="Please provide relevant details about your use case, such as the type of content you’re storing and whether this will be a one-time or recurring request."
                required
                slotProps={{
                  input: {
                    sx: {
                      maxWidth: '100%',
                    },
                  },
                }}
                sx={{
                  '& .MuiInputBase-input::placeholder': {
                    whiteSpace: 'normal',
                    overflow: 'visible',
                  },
                }}
                value={field.value}
              />
            )}
          />
          <Accordion
            data-testid="quota-increase-form-preview"
            detailProps={{ sx: { p: 0.25 } }}
            heading="Ticket Preview"
            summaryProps={{ sx: { paddingX: 0.25 } }}
          >
            <Stack
              data-testid="quota-increase-form-preview-content"
              sx={(theme) => ({
                backgroundColor: theme.tokens.alias.Background.Neutral,
                p: 2,
              })}
            >
              <Typography
                sx={(theme) => ({
                  font: theme.font.bold,
                  fontSize: theme.tokens.font.FontSize.M,
                })}
              >
                {summary}
              </Typography>
              <Markdown textOrMarkdown={quotaIncreaseDescription} />{' '}
              <Markdown textOrMarkdown={notes ?? ''} />
            </Stack>
          </Accordion>
          <ActionsPanel
            primaryButtonProps={{
              label: 'Submit',
              loading: submitting,
              onClick: handleSubmit,
            }}
            secondaryButtonProps={{
              label: 'Cancel',
              onClick: onClose,
            }}
          />
        </Stack>
      </form>
    </FormProvider>
  );
};
