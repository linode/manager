import { useSelector } from 'react-redux';
import { ApplicationState } from 'src/store';

export const useRegions = () => {
  const regions = useSelector(
    (state: ApplicationState) => state.__resources.regions
  );

  return regions.entities;
};
