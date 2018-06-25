import initStoryshots, { imageSnapshot } from '@storybook/addon-storyshots';
 
const getMatchOptions = ({context : {kind, story}, url}) => {
  return {
    failureThreshold: 7.0,
    failureThresholdType: 'percent',
  }
}

jest.setTimeout(30000);

initStoryshots({suite: 'Image storyshots', test: imageSnapshot({getMatchOptions})});