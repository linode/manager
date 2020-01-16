import actionCreatorFactory from 'typescript-fsa';

const actionCreator = actionCreatorFactory('@@manager/featureFlag');

export const setMaxPageSize = actionCreator<number>('setMaxPageSize');
