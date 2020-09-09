import { useSelector } from 'react-redux';
import { ApplicationState } from 'src/store';
import { ExtendedType } from 'src/store/linodeType/linodeType.reducer';

export interface UseTypesOptions {
  includeDeprecatedTypes?: boolean;
  includeShadowPlans?: boolean;
}

export const useTypes = (options?: UseTypesOptions) => {
  const types = useSelector(
    (state: ApplicationState) => state.__resources.types
  );

  const finalTypes = maybeFilterTypes(types.entities, options);

  return { types: { ...types, entities: finalTypes } };
};

export const maybeFilterTypes = (
  types: ExtendedType[],
  options?: UseTypesOptions
) => {
  const includeDeprecatedTypes = options?.includeDeprecatedTypes ?? false;
  const includeShadowPlans = options?.includeShadowPlans ?? false;

  let filteredTypes = [...types];

  if (!includeDeprecatedTypes) {
    filteredTypes = filteredTypes.filter(thisType => !thisType.isDeprecated);
  }

  if (!includeShadowPlans) {
    filteredTypes = filteredTypes.filter(thisType => !thisType.isShadowPlan);
  }

  return filteredTypes;
};
