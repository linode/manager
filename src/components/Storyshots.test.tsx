import initStoryshots, { imageSnapshot } from '@storybook/addon-storyshots';

const getMatchOptions = ({context : {kind, story}, url}) => {
    return {
        failureThreshold: 0.20,
        failureThresholdType: 'percent',
        customDiffConfig:  { threshold: 0.15 }
    }
}

jest.setTimeout(30000);

initStoryshots({
    suite: 'Image storyshots',
    test: imageSnapshot({storybookUrl: 'http://localhost:6006', getMatchOptions})
});
