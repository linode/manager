import {
  CloseIcon,
  IconButton,
  LinkButton,
  Stack,
  TextField,
  TooltipIcon,
  Typography,
} from '@linode/ui';
import Grid from '@mui/material/Grid';
import * as React from 'react';
import { useEffect } from 'react';
import type { Control } from 'react-hook-form';
import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
} from 'react-hook-form';

interface CustomHeaderTitleProps {
  control: Control;
  controlPath: string;
  index: number;
  tooltipText: string;
}

const CustomHeaderTitle = (props: CustomHeaderTitleProps) => {
  const { control, controlPath, index, tooltipText } = props;

  const headerName = useWatch({
    control,
    name: `${controlPath}[${index}].name`,
  });

  return (
    <Stack
      alignItems="center"
      direction="row"
      flexWrap="nowrap"
      sx={{ minWidth: 0 }}
    >
      <Typography
        noWrap={true}
        overflow="hidden"
        textOverflow="ellipsis"
        variant="subtitle1"
      >
        {headerName?.length ? headerName : `Custom Header ${index + 1}`}
      </Typography>
      <TooltipIcon
        labelTooltipIconSize="small"
        status="info"
        sxTooltipIcon={{ p: 1 }}
        text={tooltipText}
      />
    </Stack>
  );
};

interface CustomHeadersProps {
  controlPath: string;
}

export const CustomHeaders = (props: CustomHeadersProps) => {
  const { controlPath } = props;

  const { control, unregister } = useFormContext();

  const { append, fields, remove } = useFieldArray({
    control,
    name: controlPath,
  });

  useEffect(() => {
    if (fields.length === 0) {
      unregister(controlPath);
    }
  }, [fields, controlPath, unregister]);

  const addNewField = () => {
    append({ name: '', value: '' });
  };

  const removeField = (index: number) => {
    remove(index);
    if (fields.length === 1) {
      unregister(controlPath);
    }
  };

  return (
    <>
      <Stack mt={fields.length ? 2 : 0} spacing={2}>
        {fields?.map((field, index) => (
          <Stack
            key={field.id}
            sx={(theme) => ({
              backgroundColor: theme.tokens.alias.Background.Neutral,
              maxWidth: 416,
              p: theme.spacingFunction(16),
            })}
          >
            <Grid
              alignItems="flex-start"
              container
              flexWrap="nowrap"
              justifyContent="space-between"
            >
              <CustomHeaderTitle
                control={control}
                controlPath={controlPath}
                index={index}
                tooltipText="A custom HTTPS header to include in the delivery request."
              />
              <IconButton onClick={() => removeField(index)} sx={{ p: 0 }}>
                <CloseIcon />
              </IconButton>
            </Grid>
            <Grid container direction="column" spacing={0}>
              <Controller
                control={control}
                name={`${controlPath}[${index}].name`}
                render={({ field: controllerField, fieldState }) => (
                  <TextField
                    aria-required
                    errorText={fieldState.error?.message}
                    label="Name"
                    labelTooltipText="The name of the custom header to include in the delivery request."
                    onBlur={controllerField.onBlur}
                    onChange={controllerField.onChange}
                    value={controllerField.value}
                  />
                )}
              />
              <Controller
                control={control}
                name={`${controlPath}[${index}].value`}
                render={({ field: controllerField, fieldState }) => (
                  <TextField
                    aria-required
                    errorText={fieldState.error?.message}
                    label="Value"
                    labelTooltipText="The value of the custom header to include in the delivery request."
                    multiline
                    onBlur={controllerField.onBlur}
                    onChange={controllerField.onChange}
                    value={controllerField.value}
                  />
                )}
              />
            </Grid>
          </Stack>
        ))}
      </Stack>
      <LinkButton
        onClick={addNewField}
        sx={(theme) => ({
          mt: theme.spacingFunction(16),
          font: theme.tokens.alias.Typography.Label.Semibold.S,
        })}
      >
        Add Custom Header
      </LinkButton>
    </>
  );
};
