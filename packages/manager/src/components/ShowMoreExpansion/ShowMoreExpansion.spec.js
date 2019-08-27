const { navigateToStory } = require('../../../e2e/utils/storybook');

describe('Show More Expansion Suite', () => {
  const component = 'ShowMoreExpansion';
  const childStories = [
    'default',
    'default expanded'
  ]
  const showMore = '[data-qa-show-more-expanded]';
  const showMoreExpanded = '[data-qa-show-more-expanded=true]';
  const showMoreToggle = '[data-qa-show-more-toggle]';
  const ariaMsg = 'Incorrect aria-label'

  describe('default unexpanded menu', () => {
    beforeAll(() => {
      navigateToStory(component, childStories[0]);
    });

    it('should display show more expansion', () => {
      $(showMore).waitForDisplayed();

      const showMoreExpandedElem = $(showMore);

      expect(showMoreExpandedElem.getText())
        .withContext(`Should have some text`)
        .toMatch(/([A-z])/ig);
      expect(showMoreExpandedElem.isDisplayed())
        .withContext(`Show more panel should be displayed`)
        .toBe(true);
    });

    it('should expand on click', () => {
      const collapsedState = $(showMore).getAttribute('data-qa-show-more-expanded').includes('false');
      const ariaCollapsed = $(showMore).getAttribute('aria-expanded').includes('false');

      expect(collapsedState)
        .withContext(`Menu should be collapsed`)
        .toBe(true);
      expect(ariaCollapsed)
        .withContext(`${ariaMsg}`)
        .toBe(true);

      $(showMoreToggle).click();

      const afterClickState = $(showMoreExpanded).getAttribute('data-qa-show-more-expanded').includes('true');
      const ariaAfterClick = $(showMore).getAttribute('aria-expanded').includes('true');

      expect(afterClickState)
        .withContext(`Menu should be expanded`)
        .toBe(true);
      expect(ariaAfterClick)
        .withContext(`${ariaMsg}`)
        .toBe(true);
    });

    it('should display example text', () => {
      const exampleText = $('[data-qa-show-more-expanded] + div p');
      expect(exampleText.getText())
        .withContext(`Should have some text`)
        .toMatch(/([A-z])/ig);
    });

    it('should collapse on click', () => {
      $(showMoreToggle).click();

      const afterCollapse = $(showMore).getAttribute('data-qa-show-more-expanded').includes('false');
      const ariaAfterCollapse = $(showMore).getAttribute('aria-expanded').includes('false');

      expect(afterCollapse)
        .withContext(`Menu should be collapsed`)
        .toBe(true);
      expect(ariaAfterCollapse)
        .withContext(`${ariaMsg}`)
        .toBe(true);
    });
  })

  describe('Menu already expanded', () => {
    beforeAll(() => {
      navigateToStory(component, childStories[1]);
    });

    it('should display show more expanded', () => {
      $(showMoreExpanded).waitForDisplayed();

      const showMoreExpandedElem = $(showMoreExpanded);

      expect(showMoreExpandedElem.getText())
        .withContext(`Should have some text`)
        .toMatch(/([A-z])/ig);
      expect(showMoreExpandedElem.isDisplayed())
        .withContext(`Show more panel should be displayed`)
        .toBe(true);
    });

    it('should display example text', () => {
      const exampleText = $('[data-qa-show-more-expanded] + div p');
      expect(exampleText.getText())
        .withContext(`Should have some ipsum text`)
        .toMatch(/([A-z])/ig);
    });

    it('should collapse on click', () => {
      const afterClickState = $(showMore).getAttribute('data-qa-show-more-expanded').includes('true');
      const ariaAfterClick = $(showMore).getAttribute('aria-expanded').includes('true');

      expect(afterClickState)
        .withContext(`Menu should be expanded`)
        .toBe(true);
      expect(ariaAfterClick)
        .withContext(`${ariaMsg}`)
        .toBe(true);

      $(showMoreToggle).click();

      const collapsedState = $(showMore).getAttribute('data-qa-show-more-expanded').includes('false');
      const ariaCollapsed = $(showMore).getAttribute('aria-expanded').includes('false');

      expect(collapsedState)
        .withContext(`Menu should be collapsed`)
        .toBe(true);
      expect(ariaCollapsed)
        .withContext(`${ariaMsg}`)
        .toBe(true);
    });

    it('should expand on click', () => {
      $(showMoreToggle).click();

      const afterExpand = $(showMoreExpanded).getAttribute('data-qa-show-more-expanded').includes('true');
      const ariaAfterExpand = $(showMoreExpanded).getAttribute('aria-expanded').includes('true');

      expect(afterExpand)
        .withContext(`Menu should be expanded`)
        .toBe(true);
      expect(ariaAfterExpand)
        .withContext(`${ariaMsg}`)
        .toBe(true);
    });
  })


});
