import { useCreateInferenceApiKeyMutation } from '@linode/queries';
import {
  ActionsPanel,
  Box,
  DateTimeField,
  Drawer,
  FormControlLabel,
  Notice,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@linode/ui';
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
      <Drawer onClose={handleClose} open={open} title="Create API Key">
        {error && (
          <Notice spacingBottom={16} variant="error">
            {error}
          </Notice>
        )}
        <TextField
          label="Name"
          onChange={(e) => setLabel(e.target.value)}
          placeholder=""
          value={label}
        />

        <TextField
          label="Description"
          multiline
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter a description for this API key"
          rows={1}
          value={description}
        />

        <Box sx={{ mb: 2, mt: 2 }}>
          <Typography
            sx={{ fontFamily: 'LatoWebBold, sans-serif', mb: 1 }}
            variant="body1"
          >
            Expiry
          </Typography>
          <RadioGroup
            onChange={(e) => setExpiry(e.target.value as ExpiryOption)}
            value={expiry}
          >
            <FormControlLabel
              control={<Radio />}
              label="In 6 months"
              value="6months"
            />
            <FormControlLabel
              control={<Radio />}
              label="In 3 months"
              value="3months"
            />
            <FormControlLabel control={<Radio />} label="Never" value="never" />
            {/* Commented for now since we don't have a great UI for picking custom expiry dates, and it's not a priority feature 
            <FormControlLabel
              control={<Radio />}
              label="Custom"
              value="custom"
            /> 
            */}
          </RadioGroup>
          {expiry === 'custom' && (
            <Box sx={{ mt: 1 }}>
              <DateTimeField
                label="Expiry date"
                onChange={(date: DateTime | null) => setCustomExpiryDate(date)}
                value={customExpiryDate}
              />
            </Box>
          )}
        </Box>

        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'create-api-key-submit',
            label: 'Create API key',
            loading: isSubmitting,
            onClick: handleSubmit,
            type: 'button',
          }}
          secondaryButtonProps={{
            'data-testid': 'create-api-key-cancel',
            label: 'Cancel',
            onClick: handleClose,
          }}
        />
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
