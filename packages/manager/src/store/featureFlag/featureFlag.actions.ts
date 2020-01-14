import actionCreatorFactory from 'typescript-fsa';

const actionCreator = actionCreatorFactory('@@manager/featureFlag');

export const setPageSize = actionCreator<number>('setPageSize');
