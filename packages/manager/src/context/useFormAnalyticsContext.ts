import { useCallback, useState } from 'react';

export interface FormAnalyticsContextProps {
  firstTouchedInputName: string | undefined;
  formName: string | undefined;
  updateState: (newState: UseFormAnalyticsContextOptions) => void;
}

export const defaultContext: FormAnalyticsContextProps = {
  firstTouchedInputName: undefined,
  formName: undefined, // TODO: Do we need this?
  updateState: () => void 0,
};

export type UseFormAnalyticsContextOptions = {
  firstTouchedInputName: string;
  formName: string;
};

export const useFormAnalyticsContext = (): FormAnalyticsContextProps => {
  const [state, setState] = useState({ ...defaultContext });

  const updateState = useCallback(
    (newState: UseFormAnalyticsContextOptions) =>
      setState((prevState) => ({ ...prevState, ...newState })),
    []
  );

  return {
    ...state,
    updateState,
  };
};
