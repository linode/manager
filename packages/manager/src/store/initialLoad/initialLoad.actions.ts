import actionCreatorFactory from 'typescript-fsa';

const actionCreator = actionCreatorFactory('@@CLOUDMANAGER/LOADING');

/** user is refreshing the page and redux state needs to be synced with local storage */
export const handleLoadingDone = actionCreator('DONE');
