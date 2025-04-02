import {
  Autocomplete,
  FormControlLabel,
  IconButton,
  TextField,
  Toggle,
  Typography,
} from '@linode/ui';
import Close from '@mui/icons-material/Close';
import React from 'react';

import {
  formatConfigValue,
  isConfigBoolean,
  isConfigStringWithEnum,
} from '../../utilities';
import {
  StyledBox,
  StyledChip,
  StyledWrapper,
} from './DatabaseConfigurationItem.style';

import type { ConfigurationOption } from './DatabaseConfigurationSelect';
import type { ConfigValue } from '@linode/api-v4';

interface Props {
  configItem?: ConfigurationOption;
  engine: string;
  errorText: string | undefined;
  onChange: (config: ConfigValue) => void;
  onRemove?: (label: string) => void;
}

export const DatabaseConfigurationItem = (props: Props) => {
  const { configItem, engine, errorText, onChange, onRemove } = props;
  const configLabel = configItem?.label || '';

  const renderInputField = () => {
    if (configItem && isConfigBoolean(configItem)) {
      return (
        <FormControlLabel
          control={
            <Toggle
              checked={Boolean(configItem.value)}
              onChange={(e) => onChange(e.target.checked)}
            />
          }
          label={formatConfigValue(String(configItem.value))}
        />
      );
    }
    if (configItem && isConfigStringWithEnum(configItem)) {
      const options =
        configItem.enum?.map((option) => ({ label: option })) || [];
      const selectedValue = options.find(
        (option) => option.label === String(configItem.value)
      );
      return (
        <Autocomplete
          onChange={(_, selected) => {
            onChange(selected?.label ?? '');
          }}
          renderInput={(params) => (
            <TextField {...params} label="" placeholder="Select an option" />
          )}
          disableClearable
          filterOptions={(options) => options}
          isOptionEqualToValue={(option, value) => option.label === value.label}
          label={''}
          options={options}
          value={selectedValue ?? options[0]}
        />
      );
    }
    if (configItem?.type === 'number' || configItem?.type === 'integer') {
      return (
        <TextField
          placeholder={
            configItem.isNew ? String(configItem?.example ?? '') : ''
          }
          errorText={errorText}
          fullWidth
          label=""
          name={configLabel}
          onChange={(e) => onChange(Number(e.target.value))}
          type="number"
          value={Number(configItem.value)}
        />
      );
    }

    if (
      configItem?.type === 'string' ||
      (Array.isArray(configItem?.type) &&
        configItem?.type.includes('string') &&
        !configItem.enum)
    ) {
      return (
        <TextField
          errorText={errorText}
          fullWidth
          label=""
          name={configLabel}
          onChange={(e) => onChange(e.target.value)}
          placeholder={String(configItem.example)}
          type="text"
          value={configItem.value ? String(configItem.value) : ''}
        />
      );
    }
    return null;
  };

  return (
    <StyledWrapper
      alignItems="flex-start"
      display="flex"
      justifyContent="space-between"
    >
      <StyledBox>
        <Typography
          sx={(theme) => ({
            font: theme.tokens.alias.Typography.Body.Bold,
            mr: 0.5,
          })}
        >
          {`${engine}.${configLabel}`}
        </Typography>
        {configItem?.restart_cluster && (
          <StyledChip color="warning" label="restarts service" size="small" />
        )}
        {configItem?.description && (
          <Typography mt={0.5}>{configItem?.description}</Typography>
        )}
        {renderInputField()}
      </StyledBox>

      {configItem?.isNew && configItem && onRemove && (
        <IconButton
          disableRipple
          onClick={() => onRemove(configItem?.label)}
          size="large"
        >
          <Close />
        </IconButton>
      )}
    </StyledWrapper>
  );
};
