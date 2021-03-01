import { ExtendedType } from 'src/store/linodeType/linodeType.reducer';

export const filterCurrentTypes = (types: ExtendedType[] = []) => {
  return types.filter(
    (thisType) => !thisType.isDeprecated && !thisType.isShadowPlan
  );
};
