import { APIError } from '@linode/api-v4/lib/types';
import { connect } from 'react-redux';
import { ExtendedType } from 'src/store/linodeType/linodeType.reducer';
import { ApplicationState } from 'src/store';
import { UseTypesOptions, maybeFilterTypes } from 'src/hooks/useTypes';
export interface WithTypesProps {
  typesData: ExtendedType[];
  typesLoading: boolean;
  typesError?: APIError[];
}

export default (options?: UseTypesOptions) =>
  connect((state: ApplicationState) => {
    const allTypes = state.__resources.types.entities;

    const finalTypes = maybeFilterTypes(allTypes, options);

    return {
      typesData: finalTypes,
      typesLoading: state.__resources.types?.loading ?? false,
      typesError: state.__resources.types?.error
    };
  });
