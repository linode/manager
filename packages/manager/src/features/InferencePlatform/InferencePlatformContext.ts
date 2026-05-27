import { createContext, useContext } from 'react';

import type { InferenceModel } from './inferenceService';

export interface InferencePlatformContextValue {
  isModelsLoading: boolean;
  models: InferenceModel[];
}

const defaultValue: InferencePlatformContextValue = {
  isModelsLoading: true,
  models: [],
};

export const InferencePlatformContext =
  createContext<InferencePlatformContextValue>(defaultValue);

export const useInferencePlatform = (): InferencePlatformContextValue =>
  useContext(InferencePlatformContext);
