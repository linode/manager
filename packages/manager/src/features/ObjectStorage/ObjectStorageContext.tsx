import type { ReactNode } from 'react';
import React, { createContext, useContext, useState } from 'react';

import type { EndpointMultiselectValue } from 'src/features/ObjectStorage/Partials/EndpointMultiselect';

// TODO: EndpointMultiselect must be modified to work directly on ObjectStorageEndpoint objects
//  rather than EndpointMultiselectValue objects
export interface ObjectStorageSelectionContext {
  selectedSummaryEndpoints: EndpointMultiselectValue[];
  setSelectedSummaryEndpoints: (endpoints: EndpointMultiselectValue[]) => void;
}

const ObjectStorageSelectionCtx = createContext<
  ObjectStorageSelectionContext | undefined
>(undefined);

export const ObjectStorageSelectionProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [selectedSummaryEndpoints, setSelectedSummaryEndpoints] = useState<
    EndpointMultiselectValue[]
  >([]);
  return (
    <ObjectStorageSelectionCtx.Provider
      value={{ selectedSummaryEndpoints, setSelectedSummaryEndpoints }}
    >
      {children}
    </ObjectStorageSelectionCtx.Provider>
  );
};

export const useObjectStorageSelection = (): ObjectStorageSelectionContext => {
  const ctx = useContext(ObjectStorageSelectionCtx);
  if (!ctx) {
    throw new Error(
      'useObjectStorageSelection must be used within ObjectStorageSelectionProvider'
    );
  }
  return ctx;
};
