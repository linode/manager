import { Font } from '@akamai/cds-tokens';
import { getAPIErrorOrDefault } from '@akamai/compute-ui-core/api';
import {
  ActionsPanel,
  Autocomplete,
  Box,
  Checkbox,
  Divider,
  Stack,
  TextField,
  TooltipIcon,
  Typography,
} from '@linode/ui';
import { scrollErrorIntoViewV2 } from '@linode/utilities';
import { useTheme } from '@mui/material/styles';
import { enqueueSnackbar } from 'notistack';
import React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import type { FieldPath, FieldPathByValue } from 'react-hook-form';

import { HideShowText } from 'src/components/PasswordInput/HideShowText';
import { deepEqual } from 'src/features/CloudPulse/Utils/utils';
import { useVerifyNotificationChannel } from 'src/queries/cloudpulse/alerts';

import {
  WEBHOOK_VERIFY_FAILURE_MESSAGE,
  WEBHOOK_VERIFY_SUCCESS_MESSAGE,
} from './constants';
import { NotificationChannelWebhookCustomHeaders } from './NotificationChannelWebhookCustomHeaders';
import {
  buildVerifyWebhookPayload,
  resolveWebhookErrorField,
} from './utilities';

import type { Item } from '../../constants';
import type { CreateNotificationChannelForm, WebhookFormValues } from './types';
import type { APIError, WebhookAuthenticationType } from '@linode/api-v4';

const authenticationTypeOptions: Item<string, WebhookAuthenticationType>[] = [
  { label: 'None', value: 'none' },
  { label: 'Basic', value: 'basic' },
];

const PENDO_ID_PREFIX = 'monitor-alerts-notification-channels-create-webhook';

export interface NotificationChannelWebhookProps {
  /**
   * Form reference for the scrolling errors into view
   */
  formRef: React.RefObject<HTMLFormElement | null>;
  /**
   * Whether the current webhook payload has passed Test Connection.
   */
  isConnectionVerified: boolean;
  /**
   * The form field path of the webhook details object (`details.webhook`),
   * used to drive every nested Controller in this component.
   */
  name: FieldPathByValue<CreateNotificationChannelForm, WebhookFormValues>;
  /**
   * Called whenever the webhook connection has been successfully verified
   * or needs to be re-verified (e.g. after a field changes). Used by the
   * parent form to gate the Submit button on a successful Test Connection.
   */
  onConnectionVerificationChange: (verified: boolean) => void;
}

export const NotificationChannelWebhook = (
  props: NotificationChannelWebhookProps
) => {
  const {
    formRef,
    isConnectionVerified,
    name,
    onConnectionVerificationChange,
  } = props;
  const theme = useTheme();
  const { control, setError, setValue, trigger } =
    useFormContext<CreateNotificationChannelForm>();

  const authenticationType = useWatch({
    control,
    name: `${name}.authentication.type`,
  });

  const webhookValues = useWatch({ control, name });

  const { isPending: isVerifying, mutateAsync: verifyChannel } =
    useVerifyNotificationChannel();

  const handleFieldChange = <T,>(
    newValue: T,
    fieldOnChange: (value: T) => void
  ) => {
    if (isConnectionVerified) {
      onConnectionVerificationChange(false);
    }
    fieldOnChange(newValue);
  };
  // Holds the most recent `useWatch` value so an async Test Connection handler
  // can compare against the current (reactive) values at resolve time.
  const latestWebhookValuesRef = React.useRef(webhookValues);
  latestWebhookValuesRef.current = webhookValues;

  const handleTestConnection = async () => {
    // The webhook values that this request is actually testing, captured from
    // the reactive `useWatch` value at the time the request is sent.
    const testedValues = webhookValues;

    try {
      const response = await verifyChannel(
        buildVerifyWebhookPayload(testedValues)
      );

      // Ignore stale responses: if the webhook values changed while the
      // request was in flight, the result no longer reflects the current
      // configuration, so keep the connection unverified.
      if (!deepEqual(testedValues, latestWebhookValuesRef.current)) {
        return;
      }

      const isSuccessfulConnection =
        response.webhook.http_status >= 200 &&
        response.webhook.http_status < 400;

      onConnectionVerificationChange(isSuccessfulConnection);
      enqueueSnackbar(
        isSuccessfulConnection
          ? WEBHOOK_VERIFY_SUCCESS_MESSAGE
          : WEBHOOK_VERIFY_FAILURE_MESSAGE,
        { variant: isSuccessfulConnection ? 'success' : 'error' }
      );
    } catch (error) {
      onConnectionVerificationChange(false);

      const apiErrors = getAPIErrorOrDefault(
        error,
        WEBHOOK_VERIFY_FAILURE_MESSAGE
      );

      const fieldErrors: APIError[] = [];
      const generalErrors: APIError[] = [];

      for (const apiError of apiErrors) {
        const fieldName = apiError.field
          ? resolveWebhookErrorField(apiError.field, name)
          : undefined;

        if (!fieldName) {
          generalErrors.push(apiError);
          continue;
        }

        fieldErrors.push(apiError);
        setError(fieldName, { message: apiError.reason });
      }

      if (fieldErrors.length > 0) {
        scrollErrorIntoViewV2(formRef);
      }

      if (generalErrors.length > 0) {
        enqueueSnackbar(generalErrors[0].reason, { variant: 'error' });
      } else if (apiErrors.length === 0) {
        enqueueSnackbar(WEBHOOK_VERIFY_FAILURE_MESSAGE, { variant: 'error' });
      }
    }
  };

  // Test Connection only requires the webhook's own fields to be valid; it
  // should not be gated by unrelated form fields (e.g. the channel name or
  // type), so we validate just the webhook details.
  const handleTestConnectionClick = async () => {
    const webhookPaths: FieldPath<CreateNotificationChannelForm>[] = [
      `${name}.endpoint_url`,
      `${name}.authentication.type`,
      `${name}.authentication.details.basic_authentication_user`,
      `${name}.authentication.details.basic_authentication_password`,
      `${name}.client_certificate_details.tls_hostname`,
      `${name}.client_certificate_details.client_ca_certificate`,
      `${name}.client_certificate_details.client_certificate`,
      `${name}.client_certificate_details.client_private_key`,
      `${name}.custom_headers`,
    ];

    const isValid = await trigger(webhookPaths);

    if (!isValid) {
      scrollErrorIntoViewV2(formRef);
      return;
    }

    handleTestConnection();
  };

  return (
    <Stack spacing={2}>
      <Controller
        control={control}
        name={`${name}.authentication.type`}
        render={({ field, fieldState }) => (
          <Autocomplete
            data-qa-autocomplete="webhook-authentication-type-select"
            disableClearable
            errorText={fieldState.error?.message}
            label="Authentication Type"
            onBlur={field.onBlur}
            onChange={(_, selected) => {
              if (selected.value === 'none') {
                setValue(
                  `${name}.authentication.details.basic_authentication_user`,
                  ''
                );
                setValue(
                  `${name}.authentication.details.basic_authentication_password`,
                  ''
                );
              }
              handleFieldChange(selected.value, field.onChange);
            }}
            options={authenticationTypeOptions}
            textFieldProps={{
              labelTooltipText:
                'The authentication method for requests sent to your webhook endpoint.',
              inputProps: {
                'data-pendo-id': `${PENDO_ID_PREFIX}-Authentication-Type`,
              },
            }}
            value={
              authenticationTypeOptions.find(
                (option) => option.value === field.value
              ) ?? authenticationTypeOptions[0]
            }
          />
        )}
      />
      {authenticationType === 'basic' && (
        <>
          <Controller
            control={control}
            name={`${name}.authentication.details.basic_authentication_user`}
            render={({ field, fieldState }) => (
              <TextField
                errorText={fieldState.error?.message}
                inputProps={{
                  'data-pendo-id': `${PENDO_ID_PREFIX}-Username`,
                }}
                label="Username"
                noMarginTop
                onBlur={field.onBlur}
                onChange={(event) =>
                  handleFieldChange(event.target.value, field.onChange)
                }
                value={field.value}
              />
            )}
          />
          <Controller
            control={control}
            name={`${name}.authentication.details.basic_authentication_password`}
            render={({ field, fieldState }) => (
              <HideShowText
                errorText={fieldState.error?.message}
                inputProps={{
                  'data-pendo-id': `${PENDO_ID_PREFIX}-Password`,
                }}
                label="Password"
                noMarginTop
                onBlur={field.onBlur}
                onChange={(event) =>
                  handleFieldChange(event.target.value, field.onChange)
                }
                value={field.value}
              />
            )}
          />
        </>
      )}
      <Controller
        control={control}
        name={`${name}.endpoint_url`}
        render={({ field, fieldState }) => (
          <TextField
            errorText={fieldState.error?.message}
            inputProps={{
              'data-pendo-id': `${PENDO_ID_PREFIX}-Endpoint-URL`,
            }}
            label="Endpoint URL"
            labelTooltipText="The webhook URL where alert notifications will be sent."
            noMarginTop
            onBlur={field.onBlur}
            onChange={(value) => handleFieldChange(value, field.onChange)}
            placeholder="Endpoint URL"
            value={field.value}
          />
        )}
      />
      <Controller
        control={control}
        name={`${name}.data_compression`}
        render={({ field }) => (
          <Checkbox
            checked={field.value === 'gzip'}
            data-pendo-id={`${PENDO_ID_PREFIX}-Send-Compressed-Data`}
            onChange={(_, checked) =>
              handleFieldChange(checked ? 'gzip' : 'none', field.onChange)
            }
            sx={{ paddingLeft: 0 }}
            text="Send Compressed Data"
          />
        )}
      />
      <Divider sx={{ marginBottom: 0, marginTop: 0 }} />
      <Typography sx={{ margin: 0 }} variant="h2">
        Connection Settings
      </Typography>
      <Box alignItems="center" display="flex">
        <Typography sx={{ margin: 0 }} variant="h3">
          Client Certificate Authentication&nbsp;
          <span
            style={{ fontWeight: theme.tokens.font.FontWeight.Regular.Normal }}
          >
            (optional)
          </span>
        </Typography>
        <TooltipIcon
          labelTooltipIconSize="small"
          status="info"
          sxTooltipIcon={{ padding: 1 }}
          text="Certificate details used to authenticate requests and verify the endpoint during mutual TLS (mTLS) connections. Required only if the endpoint enforces client certificate authentication."
        />
      </Box>
      <Controller
        control={control}
        name={`${name}.client_certificate_details.tls_hostname`}
        render={({ field, fieldState }) => (
          <TextField
            errorText={fieldState.error?.message}
            inputProps={{
              'data-pendo-id': `${PENDO_ID_PREFIX}-TLS-Hostname`,
            }}
            label="TLS Hostname"
            labelTooltipText="The hostname used to verify the server's certificate. If not provided, it's derived from the endpoint URL."
            multiline
            noMarginTop
            onBlur={field.onBlur}
            onChange={(event) =>
              handleFieldChange(event.target.value, field.onChange)
            }
            value={field.value}
          />
        )}
      />
      <Controller
        control={control}
        name={`${name}.client_certificate_details.client_ca_certificate`}
        render={({ field, fieldState }) => (
          <TextField
            errorText={fieldState.error?.message}
            inputProps={{
              'data-pendo-id': `${PENDO_ID_PREFIX}-CA-Certificate`,
            }}
            label="CA Certificate"
            labelTooltipText="The CA certificate used to verify the certificate presented by the webhook endpoint. If the certificate is not signed by a well-known certification authority, enter the CA certificate in the PEM format."
            multiline
            noMarginTop
            onBlur={field.onBlur}
            onChange={(event) =>
              handleFieldChange(event.target.value, field.onChange)
            }
            value={field.value}
          />
        )}
      />
      <Controller
        control={control}
        name={`${name}.client_certificate_details.client_certificate`}
        render={({ field, fieldState }) => (
          <TextField
            errorText={fieldState.error?.message}
            inputProps={{
              'data-pendo-id': `${PENDO_ID_PREFIX}-Client-Certificate`,
            }}
            label="Client Certificate"
            labelTooltipText="The client certificate used to authenticate requests to the webhook endpoint. Provide the certificate in PEM format."
            multiline
            noMarginTop
            onBlur={field.onBlur}
            onChange={(event) =>
              handleFieldChange(event.target.value, field.onChange)
            }
            value={field.value}
          />
        )}
      />
      <Controller
        control={control}
        name={`${name}.client_certificate_details.client_private_key`}
        render={({ field, fieldState }) => (
          <HideShowText
            errorText={fieldState.error?.message}
            inputProps={{
              'data-pendo-id': `${PENDO_ID_PREFIX}-Client-Private-Key`,
            }}
            label="Client Private Key"
            labelTooltipText="The private key used with the client certificate. Provide the key in PKCS#8 format."
            noMarginTop
            onBlur={field.onBlur}
            onChange={(event) =>
              handleFieldChange(event.target.value, field.onChange)
            }
            value={field.value}
          />
        )}
      />
      <Divider sx={{ marginBottom: 0, marginTop: 0 }} />
      <NotificationChannelWebhookCustomHeaders
        handleFieldChange={handleFieldChange}
        name={`${name}.custom_headers`}
      />
      <Divider sx={{ marginBottom: 0, marginTop: 0 }} />
      <Typography
        sx={{
          width: '550px',
          fontSize: Font.FontSize.Xs,
          lineHeight: Font.LineHeight.Xs,
          font: Font.FontFamily.Brand,
          letterSpacing: 0,
        }}
      >
        A successful connection test is required to finish creating this
        notification channel. If you make changes after testing, you&apos;ll
        need to test the connection again.
      </Typography>
      <ActionsPanel
        primaryButtonProps={{
          buttonType: 'outlined',
          'data-pendo-id': `${PENDO_ID_PREFIX}-Test-Connection`,
          disabled: isConnectionVerified,
          label: 'Test Connection',
          loading: isVerifying,
          onClick: handleTestConnectionClick,
        }}
        sx={{ display: 'flex', justifyContent: 'flex-start' }}
      />
    </Stack>
  );
};
