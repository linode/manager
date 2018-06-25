import initStoryshots, { imageSnapshot } from '@storybook/addon-storyshots';
 
const getMatchOptions = ({context : {kind, story}, url}) => {
  return {
    failureThreshold: 1.0,
    failureThresholdType: 'percent',
  }
}

jest.mock('global', () => global);

jest.setTimeout(30000);

initStoryshots({suite: 'Image storyshots', test: imageSnapshot({getMatchOptions})});