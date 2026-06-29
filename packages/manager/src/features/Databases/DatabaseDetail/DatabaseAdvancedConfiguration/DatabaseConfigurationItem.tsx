import {
  Badge,
  Button,
  FormError,
  FormField,
  Switch,
  TextField,
} from '@akamai/cds-components/react';
import { Alias, Spacing } from '@akamai/cds-tokens';
import { Alias as DarkThemeAlias } from '@akamai/cds-tokens/themes/dark';
import { Autocomplete, CloseIcon } from '@linode/ui';
import React from 'react';

import {
  formatConfigValue,
  isConfigBoolean,
  isConfigNumber,
  isConfigString,
  isTopLevelCategory,
} from './utilities';

import type { ConfigurationOption } from './DatabaseConfigurationSelect';
import type { ConfigValue } from '@linode/api-v4';

interface Props {
  configItem?: ConfigurationOption;
  errorText: string | undefined;
  onBlur?: () => void;
  onChange: (config: ConfigValue) => void;
  onRemove?: (label: string) => void;
}

export const DatabaseConfigurationItem = (props: Props) => {
  const { configItem, errorText, onBlur, onChange, onRemove } = props;
  const configLabel = configItem?.label || '';

  const renderInputField = () => {
    if (!configItem) {
      return null;
    }

    if (isConfigBoolean(configItem)) {
      return (
        <FormField>
          <Switch
            checked={Boolean(configItem.value)}
            onChange={(e) => onChange(e.detail)}
          >
            {formatConfigValue(String(configItem.value))}
          </Switch>
        </FormField>
      );
    }

    if (configItem.enum && isConfigString(configItem)) {
      const options =
        configItem.enum?.map((option) => ({ label: option })) || [];
      const selectedValue = options.find(
        (option) => option.label === String(configItem.value)
      );
      return (
        <Autocomplete
          autoHighlight
          disableClearable
          disablePortal={false} // Portal must be enabled for the popper to open in a CDS Drawer
          errorText={errorText}
          isOptionEqualToValue={(option, value) => option.label === value.label}
          label={''}
          onChange={(_, selected) => {
            onChange(selected?.label ?? '');
          }}
          options={options}
          placeholder="Select an option"
          value={selectedValue ?? options[0]}
        />
      );
    }

    if (isConfigString(configItem)) {
      return (
        <FormField
          error={Boolean(errorText)}
          labelPosition="top"
          onBlur={onBlur}
        >
          <TextField
            error={Boolean(errorText)}
            onChange={(e) =>
              onChange(
                (e.currentTarget as EventTarget & { value?: string })?.value ??
                  ''
              )
            }
            placeholder={String(configItem?.example ?? '')}
            value={configItem.value ? String(configItem.value) : ''}
          />
          <FormError slot="error">{errorText}</FormError>
        </FormField>
      );
    }

    if (isConfigNumber(configItem)) {
      return (
        <FormField
          error={Boolean(errorText)}
          labelPosition="top"
          onBlur={onBlur}
        >
          <TextField
            error={Boolean(errorText)}
            onChange={(e) => {
              const raw =
                (e.currentTarget as EventTarget & { value?: string })?.value ??
                '';
              if (raw === '') {
                onChange('');
              } else {
                const n = Number(raw);
                // Pass raw string for non-numeric input so Yup's typeError
                // fires with a clear message rather than receiving NaN.
                onChange(isNaN(n) ? raw : n);
              }
            }}
            placeholder={
              configItem.isNew ? String(configItem?.example ?? '') : ''
            }
            value={String(configItem.value ?? '')}
          />
          <FormError slot="error">{errorText}</FormError>
        </FormField>
      );
    }

    return null;
  };

  return (
    <div
      style={{
        alignItems: 'flex-start',
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: Spacing.S12,
      }}
    >
      <div
        style={{
          background: `light-dark(${Alias.Background.Neutral}, ${DarkThemeAlias.Background.Neutral})`,
          padding: Spacing.S8,
          width: '100%',
        }}
      >
        <p style={{ margin: 0, fontWeight: 'bold' }}>
          {isTopLevelCategory(configItem?.category ?? '')
            ? configLabel
            : `${configItem?.category}.${configLabel}`}
        </p>
        {configItem?.requires_restart && (
          <Badge color="amber">RESTARTS SERVICE</Badge>
        )}
        {configItem?.description && (
          <p style={{ marginTop: Spacing.S4, marginBottom: Spacing.S0 }}>
            {configItem?.description}
          </p>
        )}
        {renderInputField()}
      </div>

      {configItem?.isNew && configItem && onRemove && (
        <Button
          onClick={() => onRemove(configItem?.label)}
          size="large"
          style={{ paddingLeft: 12, paddingRight: 12 }}
          variant="icon"
        >
          <CloseIcon />
        </Button>
      )}
    </div>
  );
};
