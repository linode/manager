import initStoryshots, { imageSnapshot } from '@storybook/addon-storyshots';

const higherThresholdComponents = ['Skeleton Screen'];

const getMatchOptions = ({ context: { kind, story }, url }) => ({
  failureThreshold: higherThresholdComponents.includes(kind) ? 0.05 : 0.02,
  failureThresholdType: 'percent'
});

jest.setTimeout(30000);

const beforeScreenshot = (page, { context: { kind, story }, url }) => {
  const timeout = story.includes('async') ? 2000 : 600;
  return new Promise(resolve =>
    setTimeout(() => {
      resolve();
    }, timeout)
  );
};

initStoryshots({
  suite: 'Image storyshots',
  test: imageSnapshot({
    storybookUrl: 'http://manager-storybook:6006',
    getMatchOptions,
    beforeScreenshot
  })
});
