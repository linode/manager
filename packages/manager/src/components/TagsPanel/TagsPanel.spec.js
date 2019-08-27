const { navigateToStory, executeInAllStories } = require('../../../e2e/utils/storybook');
const { constants } = require('../../../e2e/constants');

describe('Tags Panel Suite', () => {
  const component = 'Tags Panel';
  const childStories = [
    'Tags panel with tags',
    'Tags panel without tags'
  ];
  const tag = '[data-qa-tag]';
  const deleteTag = '[data-qa-delete-tag]';
  const addTag = '[data-qa-add-tag]';
  const tagsSelect = '[data-qa-enhanced-select]';
  const addTagParagraph = '[data-qa-tag-p]'
  const options = '[data-qa-option]';

  const addNewTag = (tagname) => {
    $(addTag).click();
    $(tagsSelect).waitForDisplayed(constants.wait.normal);
    const startTags = $$(tag).length;
    const createTagSelect = $(`${tagsSelect} input`);
    createTagSelect.waitForDisplayed(constants.wait.normal);
    expect($(addTagParagraph).isExisting())
      .withContext(`'Add New Tag' text should not exist`)
      .toBe(false);
    expect($(addTag).isExisting())
      .withContext(`add tag button should not exist`)
      .toBe(false);
    createTagSelect.setValue(tagname);
    createTagSelect.addValue('\uE007');
    browser.waitUntil(() => {
      return $$(tag).length == startTags + 1
    }, constants.wait.normal);
  }

  const verifyTagName = (tagname) => {
    expect($(`[data-qa-tag="${tagname}"]`).isExisting())
      .withContext(`incorrect tag name`)
      .toBe(true);
    expect($(`[data-qa-tag="${tagname}"] span`).getText())
      .withContext(`incorrect span text`)
      .toBe(tagname);
  }

  const deleteTagName = (tagname) => {
    const tags = $$(tag).length;
    $(`[data-qa-tag="${tagname}"] [data-qa-delete-tag]`).click();
    browser.waitUntil(() => {
      return $$(tag).length == tags - 1
    }, constants.wait.normal);
    expect($(`[data-qa-tag="${tagname}"]`).isExisting())
      .withContext(`${tagname} should not exist in the DOM`)
      .toBe(false)
  }

  beforeEach(() => {
    navigateToStory(component, childStories[0]);
    $(addTag).waitForDisplayed(constants.wait.normal);
  });

  it('there should be a tag panel, and icons to add and delete tags', () => {
    $(tag).waitForDisplayed(constants.wait.normal);
    expect($$(tag).length)
      .withContext(`should be 3 tags`)
      .toBe(3);
    expect($$(deleteTag).length)
      .withContext(`should be 3 delete tag icons`)
      .toBe(3);
    expect($(addTag).isDisplayed())
      .withContext(`plus symbol should be displayed`)
      .toBe(true);
    expect($(addTagParagraph).isDisplayed())
      .withContext(`'Add New Tag' p element should be displayed`)
      .toBe(true);
  });

  it('can open menu with plus button', () => {
    executeInAllStories(component,childStories, () => {
      $(addTagParagraph).click();
      expect($(tagsSelect).isDisplayed())
        .withContext(`tag select should be displayed`)
        .toBe(true);
      expect($(addTagParagraph).isExisting())
        .withContext(`add new tag text should not exist`)
        .toBe(false);
      expect($(addTag).isExisting())
        .withContext(`add tag button should not exist`)
        .toBe(false);
    })
  });

 it('can open menu with Add New tag text', () => {
    executeInAllStories(component,childStories, () => {
      $(addTag).click();
      expect($(tagsSelect).isDisplayed())
        .withContext(`tag select should be displayed`)
        .toBe(true);
      expect($(addTagParagraph).isExisting())
        .withContext(`add new tag text should not exist`)
        .toBe(false);
      expect($(addTag).isExisting())
        .withContext(`add tag button should not exist`)
        .toBe(false);
    })
  });

  describe('Adding Tags', () => {
    it('can add tags', () => {
      executeInAllStories(component,childStories, () => {
        const testTag = "TEST_TAG";
        const matchingTag = `[data-qa-tag="${testTag}"]`;

        addNewTag(testTag);

        expect($(matchingTag).isDisplayed())
          .withContext(`should be one matching tag`)
          .toBe(true);
        expect($(matchingTag).getText())
          .withContext(`incorrect tag text`)
          .toBe(testTag);
      });
    });

    it('can add multiple tags', () => {
      executeInAllStories(component,childStories, () => {
        const testTag = "TEST_TAG";
        const testTag2 = "taggy tag tag";
        const testTag3 = "#!-987q924htr3-f890&$@";

        addNewTag(testTag);
        verifyTagName(testTag);

        addNewTag(testTag2);
        verifyTagName(testTag2);

        addNewTag(testTag3);
        verifyTagName(testTag3);
      });
    });
  });

  describe('Removing Tags', () => {
    it('can delete a tag', () => {
      //removes the default tagTwo
      deleteTagName('tagTwo');
    });

    it('removed tags appear in select drop down', () => {
      deleteTagName('tagTwo')
      $(addTagParagraph).click();

      expect($$(options).length)
        .withContext(`should be 5 drop down options`)
        .toBe(5);
      expect($('[data-qa-option="tagTwo"]').isExisting())
        .withContext(`tagTwo should be in the list`)
        .toBe(true);

    });

    it('added tags that are removed are not lost', () => {
      const testTag = "taggy tag tag";
      addNewTag(testTag);
      verifyTagName(testTag);

      deleteTagName(testTag);

      $(addTag).click();
      expect($$(options).length)
        .withContext(`should be 5 drop down options`)
        .toBe(5);
      expect($(`[data-qa-option="${testTag}"]`).isExisting())
        .withContext(`${testTag} should be in the list`)
        .toBe(true);
    });
  });
});
