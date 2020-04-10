import { useSelector } from 'react-redux';
import { extendTypes } from 'src/containers/types.container';
import { ApplicationState } from 'src/store';

export const useTypes = () => {
  const types = useSelector(
    (state: ApplicationState) => state.__resources.types
  );
  const _types = extendTypes(types.entities);
  return { types: { ...types, entities: _types } };
};
