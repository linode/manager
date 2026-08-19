import {
  Button,
  DateField,
  Drawer,
  FormField,
  FormLabel,
  NotificationBanner,
  RadioButton,
  RadioGroup,
  TextArea,
  TextField,
} from '@akamai/cds-components/react';
import { useCreateInferenceApiKeyMutation } from '@linode/queries';
import { Box, Stack, Typography } from '@linode/ui';
import { DateTime } from 'luxon';
import React from 'react';

import { SecretTokenDialog } from 'src/features/Profile/SecretTokenDialog/SecretTokenDialog';

interface CreateApiKeyDrawerProps {
  onClose: () => void;
  open: boolean;
}

type ExpiryOption = '3months' | '6months' | 'custom' | 'never';

const getExpiryDate = (
  option: ExpiryOption,
  customDate: DateTime | null
): null | string => {
  if (option === 'never') return null;
  if (option === 'custom' && customDate) {
    return customDate.toISO();
  }

  const months = option === '6months' ? 6 : 3;
  return DateTime.now().plus({ months }).toISO();
};

export const CreateApiKeyDrawer = ({
  onClose,
  open,
}: CreateApiKeyDrawerProps) => {
  const [label, setLabel] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [expiry, setExpiry] = React.useState<ExpiryOption>('6months');
  const [customExpiryDate, setCustomExpiryDate] =
    React.useState<DateTime | null>(null);
  const [createdApiKey, setCreatedApiKey] = React.useState<null | string>(null);
  const [validationError, setValidationError] = React.useState<null | string>(
    null
  );

  const {
    error: apiError,
    isPending: isSubmitting,
    mutateAsync: createApiKey,
    reset,
  } = useCreateInferenceApiKeyMutation();

  const handleClose = () => {
    setLabel('');
    setDescription('');
    setExpiry('6months');
    setCustomExpiryDate(null);
    setValidationError(null);
    reset();
    onClose();
  };

  const handleSecretDialogClose = () => {
    setCreatedApiKey(null);
    handleClose();
  };

  const handleSubmit = () => {
    setValidationError(null);

    if (!label.trim()) {
      setValidationError('Name is required');
      return;
    }

    if (expiry === 'custom' && !customExpiryDate) {
      setValidationError('Please select a custom expiry date');
      return;
    }

    createApiKey({
      description,
      expiry: getExpiryDate(expiry, customExpiryDate),
      key_type: 'user',
      label: label.trim(),
    }).then((response) => {
      // Show the secret dialog with the full API key
      setCreatedApiKey(response.key);
    });
  };

  const error = validationError || apiError?.[0]?.reason;

  return (
    <>
      <Drawer aria-label="Create API Key" onClose={handleClose} open={open}>
        <div slot="header">Create API Key</div>
        <div slot="body">
          {error && (
            <NotificationBanner
              style={{ marginBottom: '16px' }}
              text={error}
              type="error"
            />
          )}
          <FormField labelPosition="top" style={{ marginBottom: '16px' }}>
            <FormLabel slot="label">Name</FormLabel>
            <TextField
              onChange={(e) => setLabel(String(e.detail))}
              placeholder=""
              value={label}
            />
          </FormField>

          <FormField labelPosition="top" style={{ marginBottom: '16px' }}>
            <FormLabel slot="label">Description</FormLabel>
            <TextArea
              onChange={(e) => setDescription(String(e.detail))}
              placeholder="Enter a description for this API key"
              rows={2}
              value={description}
            />
          </FormField>

          <Box sx={{ mb: 2, mt: 2 }}>
            <Typography
              sx={{ fontFamily: 'LatoWebBold, sans-serif', mb: 1 }}
              variant="body1"
            >
              Expiry
            </Typography>
            <RadioGroup
              onChange={(e) => setExpiry(e.detail.value as ExpiryOption)}
              value={expiry}
            >
              <Stack direction="column" spacing={1}>
                <Box sx={{ alignItems: 'center', display: 'flex', gap: 1 }}>
                  <RadioButton id="expiry-6months" value="6months" />
                  <label htmlFor="expiry-6months">In 6 months</label>
                </Box>
                <Box sx={{ alignItems: 'center', display: 'flex', gap: 1 }}>
                  <RadioButton id="expiry-3months" value="3months" />
                  <label htmlFor="expiry-3months">In 3 months</label>
                </Box>
                <Box sx={{ alignItems: 'center', display: 'flex', gap: 1 }}>
                  <RadioButton id="expiry-never" value="never" />
                  <label htmlFor="expiry-never">Never</label>
                </Box>
                {/* Commented for now since we don't have a great UI for picking custom expiry dates, and it's not a priority feature 
                {
                <Box sx={{ alignItems: 'center', display: 'flex', gap: 1 }}>
                  <RadioButton id="expiry-custom" value="custom" />
                  <label htmlFor="expiry-custom">Custom</label>
                </Box>
                */}
              </Stack>
            </RadioGroup>
            {expiry === 'custom' && (
              <Box sx={{ mt: 1 }}>
                <FormField labelPosition="top">
                  <FormLabel slot="label">Expiry date</FormLabel>
                  <DateField
                    format="MMM d, yyyy"
                    mode="day"
                    onChange={(e) => {
                      // DateFieldChangeDetail contains: date, value, formatted
                      const dateValue = e.detail?.value;
                      if (dateValue) {
                        setCustomExpiryDate(DateTime.fromISO(dateValue));
                      } else {
                        setCustomExpiryDate(null);
                      }
                    }}
                    value={customExpiryDate?.toISODate() ?? ''}
                  />
                </FormField>
              </Box>
            )}
          </Box>

          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'flex-end',
              mt: 3,
            }}
          >
            <Button
              data-testid="create-api-key-cancel"
              onClick={handleClose}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              data-testid="create-api-key-submit"
              onClick={handleSubmit}
              processing={isSubmitting}
              variant="primary"
            >
              Create API key
            </Button>
          </Box>
        </div>
      </Drawer>
      <SecretTokenDialog
        onClose={handleSecretDialogClose}
        open={Boolean(createdApiKey)}
        title="API Key"
        value={createdApiKey ?? ''}
      />
    </>
  );
};
