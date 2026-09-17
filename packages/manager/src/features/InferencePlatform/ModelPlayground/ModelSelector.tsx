import { Select } from '@akamai/cds-components/react';
import { useTheme } from '@linode/ui';
import React, { useCallback, useContext, useEffect, useMemo } from 'react';

import { Box, Typography } from '../components';
import { InferenceLogo } from '../InferenceLogo';
import { useInferencePlatform } from '../InferencePlatformContext';
import { mergeInferenceModel } from '../ModelLibrary/modelLibraryUtils';
import { ModelPlaygroundModelContext } from './ModelPlaygroundContext';

import type { Model } from '../ModelLibrary/modelLibrary.types';
import type { SelectElement } from '@akamai/cds-components';

type ModelOption = {
  description: string;
  label: string;
  logo?: string;
  value: string;
};

export const ModelSelector = () => {
  const { onModelChange, selectedModel } = useContext(
    ModelPlaygroundModelContext
  );
  const { isModelsLoading, models } = useInferencePlatform();
  const theme = useTheme();

  // Merge each API model with its supplementary metadata so the playground
  // uses the same `Model` shape (and same icon fallback chain) as the Model
  // Library grid and Model Details pages.
  const mergedById = useMemo(() => {
    const map: Record<string, Model> = {};
    for (const m of models) {
      map[m.id] = mergeInferenceModel(m);
    }
    return map;
  }, [models]);

  // Only models explicitly marked as playground-compatible can be selected.
  const options: ModelOption[] = useMemo(() => {
    return models
      .filter((model) => model.playground_available)
      .map((m) => {
        const merged = mergedById[m.id];
        return {
          description: m.description,
          label: merged?.title ?? m.label ?? m.id,
          logo: merged?.modelLogo || merged?.providerLogo,
          value: m.id,
        };
      });
  }, [models, mergedById]);

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
  const selectedModelDescription = selectedOption?.description;

  const renderModelItem = useCallback(
    (item: ModelOption, bold = false) => {
      const logo = item.logo;
      return (
        <span style={{ alignItems: 'center', display: 'flex', gap: '8px' }}>
          {logo && (
            <InferenceLogo
              alt=""
              kind="model"
              style={{ flexShrink: 0, height: '16px', width: '16px' }}
              value={logo}
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
      <Typography
        style={{
          color: theme.palette.text.secondary,
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {selectedModelDescription}
      </Typography>
    </Box>
  );
};
