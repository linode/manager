import { LinodeType } from '@linode/api-v4/lib/linodes';
import { Reducer } from 'redux';
import { EntityState } from 'src/store/types';
import { isType } from 'typescript-fsa';
import {
  getLinodeTypesActions,
  getLinodeTypeActions,
} from './linodeType.actions';
import { typeLabelDetails } from 'src/features/linodes/presentation';
import { formatStorageUnits } from 'src/utilities/formatStorageUnits';
import { LINODE_NETWORK_IN } from 'src/constants';

export interface ExtendedType extends LinodeType {
  heading: string;
  subHeadings: string[];
  isDeprecated: boolean;
  isShadowPlan?: boolean;
}

export type State = EntityState<ExtendedType>;

export const defaultState: State = {
  entities: [],
  results: [],
  error: undefined,
  loading: false,
  lastUpdated: 0,
};

const reducer: Reducer<State> = (state = defaultState, action) => {
  if (isType(action, getLinodeTypesActions.started)) {
    return {
      ...state,
      loading: true,
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
      results: extendedTypes.map((t) => t.id),
    };
  }

  if (isType(action, getLinodeTypesActions.failed)) {
    const { error } = action.payload;

    return {
      ...state,
      loading: false,
      error,
    };
  }

  if (isType(action, getLinodeTypeActions.done)) {
    const { result } = action.payload;

    // If the type is already in state, don't do anything.
    if (state.results.includes(result.id)) {
      return state;
    }

    const extendedType = extendType(result);

    // There's no way to tell from the response of /linode/types/:id whether or
    // not it's one of the "shadow plans", so it's up to the dispatcher of this
    // action to make the determination.
    if (action.payload.params.isShadowPlan) {
      extendedType.isShadowPlan = true;
    }

    return {
      ...state,
      entities: [...state.entities, extendedType],
      results: [...state.results, extendedType.id],
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
    network_out,
    transfer,
    price: { monthly, hourly },
  } = type;
  const formattedLabel = formatStorageUnits(label);

  const subHeadings = [
    `$${monthly}/mo ($${hourly}/hr)`,
    typeLabelDetails(memory, disk, vcpus),
    `${transfer / 1000} TB Transfer`,
  ];

  if (network_out > 0) {
    subHeadings.push(
      `${LINODE_NETWORK_IN} Gbps In / ${network_out / 1000} Gbps Out`
    );
  }

  return {
    ...type,
    label: formattedLabel,
    heading: formattedLabel,
    subHeadings,
    isDeprecated: type.successor !== null,
  };
};
