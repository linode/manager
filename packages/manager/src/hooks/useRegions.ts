import { useSelector } from 'react-redux';
import { ApplicationState } from 'src/store';

export const useRegions = () =>
  useSelector((state: ApplicationState) => state.__resources.regions);

export default useRegions;
