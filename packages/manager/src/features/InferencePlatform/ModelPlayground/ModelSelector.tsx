import { Select } from '@akamai/cds-components/react';
import { useTheme } from '@linode/ui';
import React, { useCallback, useContext, useEffect, useMemo } from 'react';

import { Box, Typography } from '../components';
import { useInferencePlatform } from '../InferencePlatformContext';
import { MODEL_SUPPLEMENTARY } from '../ModelLibrary/modelLibrary.supplementary';
import { providerIcon, providerIconStyles } from '../utils';
import { ModelPlaygroundModelContext } from './ModelPlaygroundContext';

import type { SelectElement } from '@akamai/cds-components';

type ModelOption = { label: string; value: string };

export const ModelSelector = () => {
  const { onModelChange, selectedModel } = useContext(
    ModelPlaygroundModelContext
  );
  const { isModelsLoading, models } = useInferencePlatform();
  const theme = useTheme();

  // There is currently no information in the API response to determine if the
  // model is compatible with the model playground besides the presence of
  // "embedding" in the model ID, so we filter those out here.
  const options: ModelOption[] = useMemo(() => {
    const filtered = models.filter((m) => !m.id.includes('embedding'));
    return filtered.map((m) => ({
      label: MODEL_SUPPLEMENTARY[m.id]?.title ?? m.id,
      value: m.id,
    }));
  }, [models]);

  // Once models load, default-select the first one if the current selection
  // is no longer in the list.
  useEffect(() => {
    if (isModelsLoading) {
      return;
    }
    if (options.length === 0) {
      onModelChange('');
    } else if (!options.some((o) => o.value === selectedModel)) {
      onModelChange(options[0].value);
    }
  }, [isModelsLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedOption = options.find((o) => o.value === selectedModel) ?? null;

  const renderModelItem = useCallback(
    (item: ModelOption, bold = false) => {
      const logo = MODEL_SUPPLEMENTARY[item.value]?.providerLogo ?? null;
      const Icon = logo ? providerIcon(logo) : null;
      return (
        <span style={{ alignItems: 'center', display: 'flex', gap: '8px' }}>
          {Icon && (
            <Icon
              style={{
                flexShrink: 0,
                height: '16px',
                width: '16px',
                ...providerIconStyles(logo!, theme),
              }}
            />
          )}
          <span style={bold ? { font: theme.font.bold } : undefined}>
            {item.label}
          </span>
        </span>
      );
    },
    [theme]
  );

  const renderDropdownItem = useCallback(
    (item: ModelOption) =>
      renderModelItem(item, item.value === selectedOption?.value),
    [renderModelItem, selectedOption]
  );

  // CDS pattern: onChange detail is the native DOM event, not `T`; read e.target as SelectElement<T> to get the selected item.
  const handleChange = (e: Event) => {
    const { selected } = e.target as SelectElement<ModelOption>;
    if (selected) {
      onModelChange(selected.value);
    }
  };

  return (
    <Box
      style={{
        alignItems: 'center',
        backgroundColor:
          theme.palette.mode === 'light' ? theme.bg.white : theme.bg.offWhite,
        display: 'flex',
        flexShrink: 0,
        gap: '16px',
        height: 56,
        padding: '0 16px',
      }}
    >
      <Typography
        style={{
          flexShrink: 0,
          font: theme.font.semibold,
          whiteSpace: 'nowrap',
        }}
      >
        Model
      </Typography>
      <Box style={{ minWidth: 220 }}>
        <Select<ModelOption>
          disabled={isModelsLoading || options.length === 0}
          items={options}
          itemTemplateFn={renderDropdownItem}
          onChange={handleChange}
          placeholder={
            isModelsLoading ? 'Loading models...' : 'No models available'
          }
          selected={selectedOption}
          selectedItemTemplateFn={(item) => renderModelItem(item, true)}
          valueFn={(item: ModelOption) => item.value}
        />
      </Box>
    </Box>
  );
};
