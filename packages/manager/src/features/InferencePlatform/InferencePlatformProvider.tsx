import { useQuery } from '@tanstack/react-query';
import React from 'react';

import { InferencePlatformContext } from './InferencePlatformContext';
import { fetchInferenceModels } from './inferenceService';

import type { InferenceModel } from './inferenceService';

interface Props {
  children: React.ReactNode;
}

export const InferencePlatformProvider = ({ children }: Props) => {
  const { data: models = [], isLoading: isModelsLoading } = useQuery<
    InferenceModel[]
  >({
    queryFn: () =>
      fetchInferenceModels()
        .then((res) => res.json())
        .then((data): InferenceModel[] => data.data ?? []),
    queryKey: ['inference', 'models'],
    staleTime: 5 * 60 * 1000,
  });

  return (
    <InferencePlatformContext.Provider value={{ isModelsLoading, models }}>
      {children}
    </InferencePlatformContext.Provider>
  );
};
