import { Capabilities } from '@linode/api-v4/lib/regions/types';
import { useSelector } from 'react-redux';
import { ApplicationState } from 'src/store';

export const useRegions = () =>
  useSelector((state: ApplicationState) => state.__resources.regions);

export const useFilteredRegions = (capability?: Capabilities) => {
  const regions = useSelector(
    (state: ApplicationState) => state.__resources.regions
  );

  const filteredRegions = capability
    ? regions.entities.filter(thisRegion =>
        thisRegion.capabilities.includes(capability)
      )
    : [];

  return { filteredRegions };
};

export default useRegions;
