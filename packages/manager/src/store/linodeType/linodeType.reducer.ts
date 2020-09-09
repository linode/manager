import { LinodeType } from '@linode/api-v4/lib/linodes';
import { Reducer } from 'redux';
import { EntityState } from 'src/store/types';
import { isType } from 'typescript-fsa';
import {
  getLinodeTypesActions,
  getLinodeTypeActions
} from './linodeType.actions';
import { typeLabelDetails } from 'src/features/linodes/presentation';

export interface ExtendedType extends LinodeType {
  heading: string;
  subHeadings: [string, string];
  isDeprecated: boolean;
  isShadowPlan?: boolean;
}

export type State = EntityState<ExtendedType>;

export const defaultState: State = {
  entities: [],
  results: [],
  error: undefined,
  loading: false,
  lastUpdated: 0
};

const reducer: Reducer<State> = (state = defaultState, action) => {
  if (isType(action, getLinodeTypesActions.started)) {
    return {
      ...state,
      loading: true
    };
  }

  if (isType(action, getLinodeTypesActions.done)) {
    const { result } = action.payload;

    const extendedTypes = result.map(extendType);

    return {
      ...state,
      loading: false,
      lastUpdated: Date.now(),
      entities: extendedTypes,
      results: extendedTypes.map(t => t.id)
    };
  }

  if (isType(action, getLinodeTypesActions.failed)) {
    const { error } = action.payload;

    return {
      ...state,
      loading: false,
      error
    };
  }

  if (isType(action, getLinodeTypeActions.done)) {
    const { result } = action.payload;

    const extendedType = extendType(result);

    if (action.payload.params.isShadowPlan) {
      extendedType.isShadowPlan = true;
    }

    return {
      ...state,
      // @todo: de-dupe
      entities: [...state.entities, extendedType],
      results: [...state.results, extendedType.id]
    };
  }

  return state;
};

export default reducer;

export const extendType = (type: LinodeType): ExtendedType => {
  const {
    label,
    memory,
    vcpus,
    disk,
    price: { monthly, hourly }
  } = type;
  return {
    ...type,
    heading: label,
    subHeadings: [
      `$${monthly}/mo ($${hourly}/hr)`,
      typeLabelDetails(memory, disk, vcpus)
    ] as [string, string],
    isDeprecated: type.successor !== null
  };
};
