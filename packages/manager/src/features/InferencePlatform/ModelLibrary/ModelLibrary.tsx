import { Box, Stack } from '@linode/ui';
import React, { useLayoutEffect, useRef, useState } from 'react';

import { useInferencePlatform } from '../InferencePlatformContext';
import { ModelFilter } from './ModelFilter/ModelFilter';
// import { INFERENCE_MODEL_STUBS } from './modelLibrary.supplementary-EXTRA';
import {
  applyModelFilters,
  getInputModes,
  getLanguages,
  getOutputModes,
  getProviders,
  getUseCaseTags,
  mergeInferenceModel,
} from './modelLibraryUtils';
import { ModelList } from './ModelList';

import type { ModelFilterState } from './modelLibrary.types';

const DEFAULT_FILTER_STATE: ModelFilterState = {
  inputModes: [],
  isServerless: false,
  languages: [],
  maxContextLengthK: null,
  maxParametersB: null,
  minContextLengthK: 8,
  minParametersB: 1,
  outputModes: [],
  providerLabel: null,
  searchQuery: '',
  useCaseTags: [],
};

const MODEL_LIST_BOTTOM_VIEWPORT_GAP = 48;

export const ModelLibrary = () => {
  const { isModelsLoading, models: rawModels } = useInferencePlatform();
  const filterContainerRef = useRef<HTMLDivElement | null>(null);
  const listContainerRef = useRef<HTMLDivElement | null>(null);
  // const apiIds = new Set(rawModels.map((m) => m.id));
  const inferenceModels = [
    ...rawModels,
    // ...INFERENCE_MODEL_STUBS.filter((s) => !apiIds.has(s.id)),
  ];
  const models = inferenceModels.map(mergeInferenceModel);
  const [filterState, setFilterState] =
    useState<ModelFilterState>(DEFAULT_FILTER_STATE);
  const [modelListHeight, setModelListHeight] = useState<number>(320);

  const handleFilterChange = (next: Partial<ModelFilterState>) => {
    setFilterState((prev) => ({ ...prev, ...next }));
  };

  const filteredModels = applyModelFilters(models, filterState);
  const providers = getProviders(models);
  const languages = getLanguages(models);
  const inputModes = getInputModes(models);
  const outputModes = getOutputModes(models);
  const useCaseTags = getUseCaseTags(models);

  useLayoutEffect(() => {
    const updateModelListHeight = () => {
      const filterContainer = filterContainerRef.current;
      const listContainer = listContainerRef.current;

      if (!filterContainer || !listContainer) {
        return;
      }

      const filterBottom = filterContainer.getBoundingClientRect().bottom;
      const listStyles = window.getComputedStyle(listContainer);
      const parsedPaddingBottom = Number.parseFloat(listStyles.paddingBottom);
      const paddingBottom = Number.isNaN(parsedPaddingBottom)
        ? 0
        : parsedPaddingBottom;

      const availableHeight = Math.floor(
        window.innerHeight -
          filterBottom -
          paddingBottom -
          MODEL_LIST_BOTTOM_VIEWPORT_GAP
      );

      setModelListHeight(Math.max(240, availableHeight));
    };

    updateModelListHeight();

    const resizeObserver = new ResizeObserver(updateModelListHeight);

    if (filterContainerRef.current) {
      resizeObserver.observe(filterContainerRef.current);
    }

    if (listContainerRef.current) {
      resizeObserver.observe(listContainerRef.current);
    }

    window.addEventListener('resize', updateModelListHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateModelListHeight);
    };
  }, []);

  return (
    <Stack gap={2} ref={listContainerRef} sx={{ pt: 1, px: 2 }}>
      <Box ref={filterContainerRef}>
        <ModelFilter
          filterState={filterState}
          inputModes={inputModes}
          languages={languages}
          onFilterChange={handleFilterChange}
          outputModes={outputModes}
          providers={providers}
          useCaseTags={useCaseTags}
        />
      </Box>
      <ModelList
        height={modelListHeight}
        isLoading={isModelsLoading}
        models={filteredModels}
      />
    </Stack>
  );
};
