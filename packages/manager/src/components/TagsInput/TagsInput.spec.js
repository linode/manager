const { navigateToStory } = require('../../../e2e/utils/storybook');
const { constants } = require('../../../e2e/constants');

describe('Tags Input Suite', () => {
  const component = 'Tags Input';
  const childStories = ['Tags Input', 'Tags Input with an error'];
  const selectBox = '[data-qa-enhanced-select]';
  const tagInput = '#add-tags input';
  const tagOptions = '[data-qa-option]';
  const selectedTags = '[data-qa-multi-option]';
  const inputError = '[data-qa-textfield-error-text]';

  const inputValidation = tagText => {
    $(tagInput).setValue(tagText);
    $(tagOptions).waitForDisplayed(constants.wait.normal);
    $$(tagOptions)[0].click();
    $(inputError).waitForDisplayed(constants.wait.normal);
    expect($(inputError).getText())
      .withContext(`Incorrect error message`)
      .toContain('Length must be 3-50 characters');
  };

  beforeAll(() => {
    navigateToStory(component, childStories[0]);
  });

  it('there should be a tags input drop down with available tags', () => {
    $(selectBox).waitForDisplayed(constants.wait.normal);
    $(selectBox).click();
    $(tagOptions).waitForDisplayed(constants.wait.normal);
    const tags = $$(tagOptions).map(tag => tag.getText());
    expect(tags)
      .withContext(`Incorrect tag names found`)
      .toEqual(['tag1', 'tag2', 'tag3', 'tag4']);
  });

  it('an available tag can be selected', () => {
    $$(tagOptions)[0].click();
    $(selectedTags).waitForDisplayed(constants.wait.normal);
    expect($(selectedTags).getText())
      .withContext(`Incorrect text found`)
      .toEqual('tag1');
  });

  it('multiple tags can be selected', () => {
    $('input').click();
    $(tagOptions).waitForDisplayed(constants.wait.normal);
    $$(tagOptions)[0].click();
    browser.waitUntil(() => {
      return $$(selectedTags).length === 2;
    }, constants.wait.normal);
  });

  it('a single tag can be cleared by clicking the x icon on tag', () => {
    $('[data-qa-select-remove]').click();
    browser.waitUntil(() => {
      return $$(selectedTags).length === 1;
    }, constants.wait.normal);
  });

  it('all tags can be cleared by clicking on the x icon to clear select', () => {
    $('.react-select__indicators svg').click();
    //wait for selected tags not displayed
    $(selectedTags).waitForDisplayed(constants.wait.normal, true);
  });

  it('a new tag can be created and selected', () => {
    const testTag = 'TEST_TAG';
    $(tagInput).setValue(testTag);
    $(tagOptions).waitForDisplayed(constants.wait.normal);
    $$(tagOptions)[0].click();
    $(selectedTags).waitForDisplayed(constants.wait.normal);
    expect($(selectedTags).getText())
      .withContext(`missing created tag name`)
      .toEqual(testTag);
    $('.react-select__indicators svg').click();
  });

  it('a tag must be between 3-50 characters', () => {
    inputValidation('aa');
    navigateToStory(component, childStories[0]);
    inputValidation('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
  });

  describe('Tags Input with api error', () => {
    it('an error message should be displayed when tags can not be retrieved', () => {
      navigateToStory(component, childStories[1]);
      $(selectBox).waitForDisplayed(constants.wait.normal);
      const errorMessaage = $$('p').find(error =>
        error.getAttribute('class').includes('error')
      );
      expect(errorMessaage.getText())
        .withContext(`Incorrect text found`)
        .toContain('There was an error retrieving your tags.');
    });
  });
});
