import { yupResolver } from '@hookform/resolvers/yup';
import { Accordion, Notice, Stack, TextField, Typography } from '@linode/ui';
import * as React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { MarkdownReference } from 'src/features/Support/SupportTicketDetail/TabbedReply/MarkdownReference';
import { TabbedReply } from 'src/features/Support/SupportTicketDetail/TabbedReply/TabbedReply';
import { useProfile } from 'src/queries/profile/profile';
import { useCreateSupportTicketMutation } from 'src/queries/support';
import { scrollErrorIntoViewV2 } from 'src/utilities/scrollErrorIntoViewV2';

import {
  getQuotaIncreaseFormDefaultValues,
  getQuotaIncreaseFormSchema,
} from './utils';

import type { APIError, Quota, TicketRequest } from '@linode/api-v4';

interface QuotasIncreaseFormProps {
  onClose: () => void;
  onSuccess: (ticketId: number) => void;
  open: boolean;
  quota: Quota;
}

export interface QuotaIncreaseFormFields extends TicketRequest {
  quantity: string;
}

export const QuotasIncreaseForm = (props: QuotasIncreaseFormProps) => {
  const { onClose, quota } = props;
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [error, setError] = React.useState<APIError | null>(null);
  const formContainerRef = React.useRef<HTMLFormElement>(null);
  const { data: profile } = useProfile();

  const defaultValues = React.useMemo(
    () => getQuotaIncreaseFormDefaultValues({ profile, quantity: 0, quota }),
    [quota, profile]
  );
  const form = useForm<QuotaIncreaseFormFields>({
    defaultValues,
    mode: 'onBlur',
    resolver: yupResolver(getQuotaIncreaseFormSchema),
  });

  const { quantity, summary } = form.watch();

  const { mutateAsync: createSupportTicket } = useCreateSupportTicketMutation();

  const handleSubmit = form.handleSubmit(async (values) => {
    const { onSuccess } = props;

    setSubmitting(true);

    const payload: QuotaIncreaseFormFields = {
      description: values.description,
      quantity: values.quantity,
      summary: values.summary,
    };

    createSupportTicket(payload)
      .then((response) => {
        return response;
      })
      .then((response) => {
        onSuccess(response.id);
      })
      .catch((errResponse: APIError) => {
        setError(errResponse);
        setSubmitting(false);
        scrollErrorIntoViewV2(formContainerRef);
      });
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit} ref={formContainerRef}>
        {error && <Notice color="error">{error.reason}</Notice>}
        <Stack direction="column" gap={2}>
          <Controller
            render={({ field, fieldState }) => (
              <TextField
                onChange={(e) => {
                  field.onChange(e);
                  form.trigger('summary');
                }}
                errorText={fieldState.error?.message}
                label="Title"
                name="summary"
                placeholder="Enter a title for your ticket."
                required
                value={summary}
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
                            color: theme.tokens.color.Neutrals[80],
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
                  value={quantity}
                />
              </Stack>
            )}
            control={form.control}
            name="quantity"
          />
          <Stack direction="column">
            <Controller
              render={({ field, fieldState }) => (
                <TabbedReply
                  handleChange={(e) => {
                    field.onChange(e);
                    form.trigger('description');
                  }}
                  value={
                    getQuotaIncreaseFormDefaultValues({
                      profile,
                      quantity: Number(quantity),
                      quota,
                    }).description
                  }
                  error={fieldState.error?.message}
                  placeholder={'Enter your request for a quota increase.'}
                  required
                />
              )}
              control={form.control}
              name="description"
            />
            <Accordion
              detailProps={{ sx: { p: 0.25 } }}
              heading="Formatting Tips"
              summaryProps={{ sx: { paddingX: 0.25 } }}
              sx={(theme) => ({ mt: `${theme.spacing(0.5)} !important` })} // forcefully disable margin when accordion is expanded
            >
              <MarkdownReference />
            </Accordion>
          </Stack>
          <ActionsPanel
            primaryButtonProps={{
              disabled: Number(quantity) <= 0,
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
