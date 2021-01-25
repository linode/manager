import * as React from 'react';
import { useSelector } from 'react-redux';
import { ApplicationState } from 'src/store';
import { LinodeType } from '@linode/api-v4/lib/linodes';

export interface LinodeTypes {
  typeId: LinodeType;
}

export const useTypes = () => {
  const types = useSelector(
    (state: ApplicationState) => state.__resources.types
  );

  const typesMap = React.useMemo(() => {
    return types.entities.reduce(
      (accum, thisType) => ({
        ...accum,
        [thisType.id]: thisType
      }),
      {}
    );
  }, [types.entities]) as LinodeTypes[];

  return { types, typesMap };
};
