import type { ReactNode } from 'react';
import React, { createContext, useContext, useState } from 'react';

import type { EndpointMultiselectValue } from './shared/components/EndpointSelect/EndpointMultiSelect';

// TODO: EndpointMultiSelect must be modified to work directly on ObjectStorageEndpoint objects
//  rather than EndpointMultiselectValue objects
export interface ObjectStorageSelectionContext {
  selectedBucketsEndpointIds: null | Set<string> | undefined;
  selectedBucketsRegionIds: null | Set<string> | undefined;
  selectedSummaryEndpoints: EndpointMultiselectValue[];
  setSelectedBucketsEndpointIds: (
    endpoints: null | Set<string> | undefined
  ) => void;
  setSelectedBucketsRegionIds: (
    regions: null | Set<string> | undefined
  ) => void;
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

  const [selectedBucketsEndpointIds, setSelectedBucketsEndpointIds] = useState<
    null | Set<string> | undefined
  >(undefined);

  const [selectedBucketsRegionIds, setSelectedBucketsRegionIds] = useState<
    null | Set<string> | undefined
  >(undefined);

  return (
    <ObjectStorageSelectionCtx.Provider
      value={{
        selectedSummaryEndpoints,
        setSelectedSummaryEndpoints,
        selectedBucketsEndpointIds,
        setSelectedBucketsEndpointIds,
        selectedBucketsRegionIds,
        setSelectedBucketsRegionIds,
      }}
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
