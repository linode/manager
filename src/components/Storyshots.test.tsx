import initStoryshots, { imageSnapshot } from '@storybook/addon-storyshots';
 
const getMatchOptions = ({context : {kind, story}, url}) => {
  return {
    // Allow 10% difference
    failureThreshold: 0.1,
    failureThresholdType: 'percent',
  }
}

jest.setTimeout(30000);

initStoryshots({suite: 'Image storyshots', test: imageSnapshot({getMatchOptions})});