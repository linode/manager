import { yupResolver } from '@hookform/resolvers/yup';
import { useCreateSupportTicketMutation, useProfile } from '@linode/queries';
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

import type { APIError, Quota, TicketRequest } from '@linode/api-v4';

interface QuotasIncreaseFormProps {
  onClose: () => void;
  onSuccess: (ticketId: number) => void;
  open: boolean;
  quota: Quota;
}

export interface QuotaIncreaseFormFields extends TicketRequest {
  notes?: string;
  quantity: string;
}

export const QuotasIncreaseForm = (props: QuotasIncreaseFormProps) => {
  const { onClose, quota } = props;
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [error, setError] = React.useState<null | string>(null);
  const formContainerRef = React.useRef<HTMLFormElement>(null);
  const { data: profile } = useProfile();
  const { mutateAsync: createSupportTicket } = useCreateSupportTicketMutation();

  const defaultValues = React.useMemo(
    () => getQuotaIncreaseMessage({ profile, quantity: 0, quota }),
    [quota, profile]
  );
  const form = useForm<QuotaIncreaseFormFields>({
    defaultValues,
    mode: 'onBlur',
    resolver: yupResolver(getQuotaIncreaseFormSchema),
  });

  const { notes, quantity, summary } = form.watch();

  const quotaIncreaseDescription = getQuotaIncreaseMessage({
    profile,
    quantity: Number(quantity),
    quota,
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
            render={({ field, fieldState }) => (
              <TextField
                onChange={(e) => {
                  field.onChange(e);
                }}
                errorText={fieldState.error?.message}
                label="Title"
                name="summary"
                placeholder="Enter a title for your ticket."
                required
                value={field.value}
              />
            )}
            control={form.control}
            name="summary"
          />
          <Controller
            render={({ field, fieldState }) => (
              <Stack direction="row" gap={2}>
                <TextField
                  onChange={(e) => {
                    field.onChange(e);
                    form.trigger('quantity');
                  }}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <Typography
                          sx={(theme) => ({
                            color: theme.tokens.alias.Content.Text,
                            font: theme.font.bold,
                            fontSize: theme.tokens.font.FontSize.Xxxs,
                            mx: 1,
                            textTransform: 'uppercase',
                            userSelect: 'none',
                            whiteSpace: 'nowrap',
                          })}
                          component="span"
                        >
                          {quota.resource_metric}
                        </Typography>
                      ),
                    },
                  }}
                  errorText={fieldState.error?.message}
                  helperText={`In ${quota.region_applied} (initial limit of ${quota?.quota_limit})`}
                  label="Quantity"
                  min={1}
                  name="quantity"
                  required
                  sx={{ width: 300 }}
                  type="number"
                  value={field.value}
                />
              </Stack>
            )}
            control={form.control}
            name="quantity"
          />
          <Controller
            render={({ field, fieldState }) => (
              <TextField
                onChange={(e) => {
                  field.onChange(e);
                }}
                slotProps={{
                  input: {
                    sx: {
                      maxWidth: '100%',
                    },
                  },
                }}
                errorText={fieldState.error?.message}
                label="Notes"
                multiline
                name="notes"
                value={field.value}
              />
            )}
            control={form.control}
            name="notes"
          />
          <Accordion
            data-testid="quota-increase-form-preview"
            detailProps={{ sx: { p: 0.25 } }}
            heading="Ticket Preview"
            summaryProps={{ sx: { paddingX: 0.25 } }}
          >
            <Stack
              sx={(theme) => ({
                backgroundColor: theme.tokens.alias.Background.Neutral,
                p: 2,
              })}
              data-testid="quota-increase-form-preview-content"
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
