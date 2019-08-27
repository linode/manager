const { navigateToStory, executeInAllStories } = require('../../../e2e/utils/storybook');

describe('Tags Suite', () => {
  const component = 'Tags';
  const childStories = [
    'primary',
    'white',
    'gray',
    'editable',
  ];
  const tag = '[data-qa-tag]';

  it('should display tag in each story', () => {
    executeInAllStories(component, childStories, () => {
      const tagElem = $(tag);
      expect(tagElem.isDisplayed())
        .withContext(`Tag should be displayed`)
        .toBe(true);
    });
  });

  describe('Editable Tag Suite', () => {
    beforeAll(() => {
      navigateToStory(component, childStories[3]);
      $(tag).waitForDisplayed();
    });

    it('should be a button and display a delete icon child element', () => {
      expect($('[data-qa-delete-tag]').isDisplayed())
        .withContext(`Delete tag should be displayed`)
        .toBe(true);

      expect($('[data-qa-delete-tag]').getAttribute('type'))
        .withContext(`Should be a button`)
        .toBe('button');

      const svgIcon = $(`[data-qa-delete-tag] svg`);
      expect(svgIcon.isDisplayed())
        .withContext(`X icon should be displayed`)
        .toBe(true);
    });
  });
});
