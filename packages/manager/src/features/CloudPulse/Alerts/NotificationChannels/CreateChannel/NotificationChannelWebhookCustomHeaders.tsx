import {
  Box,
  CloseIcon,
  IconButton,
  LinkButton,
  Stack,
  TextField,
  TooltipIcon,
  Typography,
  useTheme,
} from '@linode/ui';
import { Grid } from '@mui/material';
import React from 'react';
import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
} from 'react-hook-form';
import type { FieldPathByValue } from 'react-hook-form';

import type {
  CreateNotificationChannelForm,
  WebhookCustomHeaderFormValues,
} from './types';

interface CustomHeaderTitleProps {
  /**
   * display label used when the header name is empty
   */
  fallbackLabel: string;
  /**
   * name of the current row (with the index) used to read the header name
   */
  name: FieldPathByValue<
    CreateNotificationChannelForm,
    WebhookCustomHeaderFormValues
  >;
}

interface NotificationChannelWebhookCustomHeadersProps {
  /**
   * Called when a custom header changes the webhook configuration.
   */
  handleFieldChange: <T>(
    newValue: T,
    fieldOnChange: (value: T) => void
  ) => void;
  /**
   * name (with the index) used for the component to set in form
   */
  name: FieldPathByValue<
    CreateNotificationChannelForm,
    WebhookCustomHeaderFormValues[]
  >;
}

const PENDO_ID_PREFIX = 'monitor-alerts-notification-channels-create-webhook';

const CustomHeaderTitle = (props: CustomHeaderTitleProps) => {
  const { fallbackLabel, name } = props;
  const { control } = useFormContext<CreateNotificationChannelForm>();

  const headerName = useWatch({
    control,
    name: `${name}.name`,
  });

  return (
    <Typography noWrap overflow="hidden" textOverflow="ellipsis" variant="h3">
      {headerName?.length ? headerName : fallbackLabel}
    </Typography>
  );
};

export const NotificationChannelWebhookCustomHeaders = (
  props: NotificationChannelWebhookCustomHeadersProps
) => {
  const { name, handleFieldChange } = props;
  const theme = useTheme();
  const { control } = useFormContext<CreateNotificationChannelForm>();

  const { append, fields, remove } = useFieldArray({
    control,
    name,
  });

  const addNewHeader = () => {
    handleFieldChange({ name: '', value: '' }, append);
  };

  const removeHeader = (index: number) => {
    handleFieldChange(index, remove);
  };

  return (
    <Stack spacing={2}>
      <Box alignItems="center" display="flex">
        <Typography variant="h3">
          Custom Headers&nbsp;
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
          text="HTTPS headers to include in requests sent to the webhook endpoint."
        />
      </Box>
      {fields.map((field, index) => (
        <Stack
          key={field.id}
          spacing={2}
          sx={(theme) => ({
            backgroundColor: theme.tokens.alias.Background.Neutral,
            p: theme.spacingFunction(12),
            width: 416,
          })}
        >
          <Grid
            alignItems="flex-start"
            container
            flexWrap="nowrap"
            justifyContent="space-between"
          >
            <CustomHeaderTitle
              fallbackLabel={`Header_${index + 1}`}
              name={`${name}.${index}`}
            />
            <IconButton
              data-pendo-id={`${PENDO_ID_PREFIX}-Delete-Custom-Header`}
              data-testid="close-icon-button"
              onClick={() => removeHeader(index)}
              sx={{ p: 0 }}
            >
              <CloseIcon />
            </IconButton>
          </Grid>
          <Controller
            control={control}
            name={`${name}.${index}.name`}
            render={({ field, fieldState }) => (
              <TextField
                errorText={fieldState.error?.message}
                inputProps={{
                  'data-pendo-id': `${PENDO_ID_PREFIX}-Custom-Header-Name`,
                }}
                label="Name"
                labelTooltipText="The name of the custom header to include with each webhook request."
                noMarginTop
                onBlur={field.onBlur}
                onChange={(event) => {
                  handleFieldChange(event.target.value, field.onChange);
                }}
                value={field.value}
              />
            )}
          />
          <Controller
            control={control}
            name={`${name}.${index}.value`}
            render={({ field, fieldState }) => (
              <TextField
                errorText={fieldState.error?.message}
                inputProps={{
                  'data-pendo-id': `${PENDO_ID_PREFIX}-Custom-Header-Value`,
                }}
                label="Value"
                labelTooltipText="The value of the custom header to include with each webhook request."
                multiline
                noMarginTop
                onBlur={field.onBlur}
                onChange={(event) => {
                  handleFieldChange(event.target.value, field.onChange);
                }}
                value={field.value}
              />
            )}
          />
        </Stack>
      ))}
      <LinkButton
        data-pendo-id={`${PENDO_ID_PREFIX}-Add-Custom-Header`}
        onClick={addNewHeader}
        sx={{ alignSelf: 'flex-start' }}
      >
        Add Custom Header
      </LinkButton>
    </Stack>
  );
};
