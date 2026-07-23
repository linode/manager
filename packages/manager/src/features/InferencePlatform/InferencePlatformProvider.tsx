import { useInferenceModelsQuery } from '@linode/queries';
import React from 'react';

import { InferencePlatformContext } from './InferencePlatformContext';

import type { InferenceModel } from '@linode/api-v4';

interface Props {
  children: React.ReactNode;
}

export const InferencePlatformProvider = ({ children }: Props) => {
  const { data: response, isLoading: isModelsLoading } =
    useInferenceModelsQuery();

  // Extract models from the response, defaulting to empty array
  const models: InferenceModel[] = response?.data ?? [];

  return (
    <InferencePlatformContext.Provider value={{ isModelsLoading, models }}>
      {children}
    </InferencePlatformContext.Provider>
  );
};
