import { Accordion, Notice, Stack, TextField, Typography } from '@linode/ui';
import * as React from 'react';
import { Controller, FormProvider } from 'react-hook-form';
import { useForm } from 'react-hook-form';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { MarkdownReference } from 'src/features/Support/SupportTicketDetail/TabbedReply/MarkdownReference';
import { TabbedReply } from 'src/features/Support/SupportTicketDetail/TabbedReply/TabbedReply';
import { useProfile } from 'src/queries/profile/profile';
import { useCreateSupportTicketMutation } from 'src/queries/support';
import { scrollErrorIntoViewV2 } from 'src/utilities/scrollErrorIntoViewV2';

import type { APIError, Quota, TicketRequest } from '@linode/api-v4';

interface QuotasIncreaseFormProps {
  onClose: () => void;
  onSuccess: (ticketId: number) => void;
  open: boolean;
  quota: Quota;
}

interface QuotaIncreaseFormFields extends TicketRequest {
  quantity: string;
}

export const QuotasIncreaseForm = (props: QuotasIncreaseFormProps) => {
  const { onClose, quota } = props;
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [error, setError] = React.useState<APIError | null>(null);
  const formContainerRef = React.useRef<HTMLFormElement>(null);
  const { data: profile } = useProfile();

  const defaultValues = React.useMemo(
    () => ({
      description: `**User**: ${profile?.username}<br>\n**Email**: ${profile?.email}<br>\n**Quantity**: 0<br>\n**Region**: ${quota.region_applied}`,
      quantity: '0',
      summary: `Increase ${quota.quota_name} quota in ${quota.region_applied}`,
    }),
    [quota, profile]
  );
  const form = useForm<QuotaIncreaseFormFields>({
    defaultValues,
    resolver: undefined,
  });

  const { description, quantity, summary } = form.watch();

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

  const handleQuantityChange = (value: string) => {
    // Update the quantity field
    form.setValue('quantity', value);

    // Update the description field
    const currentDescription = form.getValues('description');
    const updatedDescription = currentDescription.replace(
      /\*\*Quantity\*\*: \d+/,
      `**Quantity**: ${value || '0'}`
    );

    form.setValue('description', updatedDescription);
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit} ref={formContainerRef}>
        {error && <Notice color="error">{error.reason}</Notice>}
        <Stack direction="column" gap={2}>
          <Controller
            render={({ field, fieldState }) => (
              <TextField
                errorText={fieldState.error?.message}
                label="Title"
                name="summary"
                onChange={field.onChange}
                placeholder="Enter a title for your ticket."
                required
                value={summary}
              />
            )}
            control={form.control}
            name="summary"
          />
          <Controller
            render={({ fieldState }) => (
              <Stack direction="row" gap={2}>
                <TextField
                  slotProps={{
                    input: {
                      endAdornment: (
                        <Typography
                          sx={(theme) => ({
                            color: theme.tokens.color.Neutrals[50],
                            fontSize: theme.tokens.font.FontSize.Xxxs,
                            mx: 1,
                            userSelect: 'none',
                            whiteSpace: 'nowrap',
                          })}
                          component="span"
                        >
                          {quota.quota_name}
                        </Typography>
                      ),
                    },
                  }}
                  errorText={fieldState.error?.message}
                  helperText={`In ${quota.region_applied} - from initial limit of ${quota?.quota_limit} `}
                  label="Quantity"
                  min={1}
                  name="quantity"
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  required
                  sx={{ width: 275 }}
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
                  error={fieldState.error?.message}
                  handleChange={field.onChange}
                  placeholder={'Enter your request for a quota increase.'}
                  required
                  value={description}
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
