import { useSelector } from 'react-redux';
import { ApplicationState } from 'src/store';

export const useTypes = () => {
  const types = useSelector(
    (state: ApplicationState) => state.__resources.types
  );

  return { types };
};
