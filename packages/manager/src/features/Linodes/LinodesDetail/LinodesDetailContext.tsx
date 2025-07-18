import React from 'react';

export interface LinodeDetailContextType {
  isBareMetalInstance: boolean;
}

export const LinodesDetailContext =
  React.createContext<LinodeDetailContextType>({ isBareMetalInstance: false });

export const useLinodeDetailContext = () =>
  React.useContext(LinodesDetailContext);
