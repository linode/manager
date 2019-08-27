const { navigateToStory } = require('../../../e2e/utils/storybook');

describe('Table Suite', () => {

  beforeAll(() => {
    const component = 'Table';
    const childStories = ['default'];
    navigateToStory(component, childStories[0]);
  });

  it('should display table elements', () => {
    $('[data-qa-table]').waitForDisplayed();
    expect($$('[data-qa-column-heading]').length)
      .withContext(`Should be 3 column headings`)
      .toBe(3);
    expect($$('[data-qa-table-row]').length)
      .withContext(`Should be 3 rows`)
      .toBe(3);
    expect($$('[data-qa-table-cell]').length)
      .withContext(`Should be 9 cells`)
      .toBe(9);
  });

  it('should display the column titles', () => {
    const headings = $$('[data-qa-column-heading]').map(h => h.getText());
    const expectedHeadings = ['Head-1-1', 'Head-1-2', 'Head-1-3'];
    expect(headings)
      .withContext(`Incorrect heading value(s)`)
      .toEqual(expectedHeadings);
  });
});
