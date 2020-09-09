import { APIError } from '@linode/api-v4/lib/types';
import { connect } from 'react-redux';
import { ExtendedType } from 'src/store/linodeType/linodeType.reducer';
import { ApplicationState } from 'src/store';
import { UseTypesOptions } from 'src/hooks/useTypes';
export interface WithTypesProps {
  typesData: ExtendedType[];
  typesLoading: boolean;
  typesError?: APIError[];
}

export default (options?: UseTypesOptions) =>
  connect((state: ApplicationState, ownProps) => {
    const allTypes = state.__resources.types.entities;

    const includeDeprecatedTypes = options?.includeDeprecatedTypes ?? false;
    const includeShadowPlans = options?.includeShadowPlans ?? false;

    let filteredTypes = [...allTypes];

    if (!includeDeprecatedTypes) {
      filteredTypes = filteredTypes.filter(thisType => !thisType.isDeprecated);
    }

    if (!includeShadowPlans) {
      filteredTypes = filteredTypes.filter(thisType => !thisType.isShadowPlan);
    }

    return {
      typesData: filteredTypes,
      typesLoading: state.__resources.types?.loading ?? false,
      typesError: state.__resources.types?.error
    };
  });
