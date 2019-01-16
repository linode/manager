import {actionCreatorFactory} from 'typescript-fsa';

const actionCreator = actionCreatorFactory(`@@manager/nodeBalancer`);

export const getAllNodeBalancersActions = actionCreator.async<void, { entities: any; result: any; }, Linode.ApiFieldError[]>(`request`);

