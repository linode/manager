import { useSelector } from 'react-redux';
import { ApplicationState } from 'src/store';

export interface UseTypesOptions {
  includeDeprecatedTypes?: boolean;
  includeShadowPlans?: boolean;
}

export const useTypes = (options?: UseTypesOptions) => {
  const types = useSelector(
    (state: ApplicationState) => state.__resources.types
  );

  const includeDeprecatedTypes = options?.includeDeprecatedTypes ?? false;
  const includeShadowPlans = options?.includeShadowPlans ?? false;

  let filteredEntities = [...types.entities];

  if (!includeDeprecatedTypes) {
    filteredEntities = filteredEntities.filter(
      thisType => !thisType.isDeprecated
    );
  }

  if (!includeShadowPlans) {
    filteredEntities = filteredEntities.filter(
      thisType => !thisType.isShadowPlan
    );
  }

  return { types: { ...types, entities: filteredEntities } };
};
