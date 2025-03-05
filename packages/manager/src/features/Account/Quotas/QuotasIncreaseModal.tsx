import { Accordion, Dialog, Stack, TextField, Notice } from '@linode/ui';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { Controller, FormProvider } from 'react-hook-form';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { MarkdownReference } from 'src/features/Support/SupportTicketDetail/TabbedReply/MarkdownReference';
import { TabbedReply } from 'src/features/Support/SupportTicketDetail/TabbedReply/TabbedReply';
import { useCreateSupportTicketMutation } from 'src/queries/support';
import { scrollErrorIntoViewV2 } from 'src/utilities/scrollErrorIntoViewV2';

import type { APIError, Quota, TicketRequest } from '@linode/api-v4';

interface QuotasIncreaseModalProps {
  onClose: () => void;
  onSuccess: (ticketId: number) => void;
  open: boolean;
  quota: Quota | undefined;
}

interface QuotaIncreaseFormFields extends TicketRequest {
  quantity: string;
}

export const QuotasIncreaseModal = (props: QuotasIncreaseModalProps) => {
  const { onClose, open, quota } = props;
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [error, setError] = React.useState<APIError | null>(null);
  const formContainerRef = React.useRef<HTMLFormElement>(null);
  const form = useForm<QuotaIncreaseFormFields>({
    defaultValues: {
      description: '',
      summary: '',
    },
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

  return (
    <Dialog onClose={onClose} open={open} title="Increase Quota">
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
              render={({ field, fieldState }) => (
                <TextField
                  errorText={fieldState.error?.message}
                  helperText={`${quota?.quota_name} | Quantity of ${quota?.resource_metric} in ${quota?.region_applied} from initial limit of ${quota?.quota_limit} `}
                  label="Quantity"
                  name="quantity"
                  onChange={field.onChange}
                  placeholder="Enter the quantity you want to increase."
                  required
                  value={quantity}
                />
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
    </Dialog>
  );
};
