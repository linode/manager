import actionCreatorFactory from 'typescript-fsa';

const actionCreator = actionCreatorFactory('@@manager/feature-flags-load');

export const setFeatureFlagsLoaded = actionCreator('DONE');
