import actionCreatorFactory from 'typescript-fsa';

const actionCreator = actionCreatorFactory('@@manager/bucketDrawer');

export const openBucketDrawer = actionCreator('open');
export const closeBucketDrawer = actionCreator('close');
