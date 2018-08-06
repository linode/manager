import initStoryshots, { imageSnapshot } from '@storybook/addon-storyshots';

const getMatchOptions = ({context : {kind, story}, url}) => ({
    failureThreshold: 0.02,
    failureThresholdType: 'percent',
});

jest.setTimeout(30000);

const beforeScreenshot = (page, {context : {kind, story}, url}) => {
  return new Promise(resolve =>
      setTimeout(() => {
          resolve();
      }, 600)
  )
}

initStoryshots({
    suite: 'Image storyshots',
    test: imageSnapshot({storybookUrl: 'http://manager-storybook:6006', getMatchOptions, beforeScreenshot})
});
