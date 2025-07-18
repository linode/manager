import React from 'react';

export interface LinodeDetailContextType {
  isAlertsBetaMode: {
    get: boolean;
    set: (value: boolean) => void;
  };
  isBareMetalInstance: boolean;
}

export const LinodesDetailContext =
  React.createContext<LinodeDetailContextType>({
    isBareMetalInstance: false,
    isAlertsBetaMode: { get: false, set: () => {} },
  });

export const useLinodeDetailContext = () =>
  React.useContext(LinodesDetailContext);
