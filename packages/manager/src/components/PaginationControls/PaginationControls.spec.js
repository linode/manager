const { navigateToStory } = require('../../../e2e/utils/storybook');

describe('Pagination Controls Suite', () => {
  const component = 'Pagination Controls';
  const childStories = [
    'Interactive example'
  ]
  const previous = '[data-qa-page-previous]';
  const jumpToPage = page => `[data-qa-page-to="${page}"]`;
  const next = '[data-qa-page-next="true"]';
  const trailingEllip = '[data-testid="trailing-ellipsis"]';
  const leadingEllip = '[data-testid="leading-ellipsis"]'

  beforeEach(() =>
    navigateToStory(component, childStories[0])
  )

  it('should display pagination controls', () => {
    $(next).waitForDisplayed();

    const prevPageElem = $(previous);
    const nextPageElem = $(next);
    const availablePages = $$('[data-qa-page-to]');

    expect(prevPageElem.isDisplayed())
      .withContext(`Previous page arrow should be displayed`)
      .toBe(true);
    expect(nextPageElem.isDisplayed())
      .withContext(`Next page arrow should be displayed`)
      .toBe(true);
    expect(availablePages.length)
      .withContext(`should be more than one page available`)
      .toBeGreaterThan(1);
  });

  it('active elements are disabled', () => {
    expect($(previous).getAttribute('aria-label'))
      .withContext(`Incorrect aria label value`)
      .toEqual('Previous Page')
    expect($(previous).getAttribute('class').includes('disabled'))
      .withContext('Disabled class missing')
      .toBe(true)
    expect($(`${previous} svg`).isDisplayed())
      .withContext(`back arrow icon should be displayed`)
      .toBe(true)
  })

  it('should default to page one', () => {
    $(next).waitForDisplayed();
    const activePage = $$('[data-qa-page-to]').filter(e => e.getAttribute('class').includes('disabled'));

    expect(activePage.length)
      .withContext(`Should only be one active page`)
      .toBe(1);
    expect(activePage[0].getAttribute('data-qa-page-to'))
      .withContext(`Incorrect default page number`)
      .toBe('1');
  });

  describe('Pagination navigation ', () => {
    it('should page forward through all', () => {
      $(next).waitForDisplayed();
      let currentPage = 1;

      const canPage = (nextOrPrevious) => {
        return !$(nextOrPrevious).getAttribute('class').includes('disabled');
      }

      while(canPage(next)) {
        $(next).click();
        const activePages = $$('[data-qa-page-to]').filter(e => e.getAttribute('class').includes('disabled'));
        const newPageNumber = parseInt(activePages[0].getAttribute('data-qa-page-to'));

        expect(newPageNumber)
          .withContext(`Incorrect page number`)
          .toBe(currentPage + 1);
        currentPage++;
      }
    });

    it('should page backward through all', () => {
      $(previous).waitForDisplayed();
      $('[data-qa-page-to="10"]').click();
      let currentPage = 10;

      const canPage = (nextOrPrevious) => {
        return !$(nextOrPrevious).getAttribute('class').includes('disabled');
      }

      while(canPage(previous)) {
        $(previous).click();
        const activePages = $$('[data-qa-page-to]').filter(e => e.getAttribute('class').includes('disabled'));
        const newPageNumber = parseInt(activePages[0].getAttribute('data-qa-page-to'));

        expect(newPageNumber)
        .withContext(`Incorrect page number`)
        .toBe(currentPage - 1);
        currentPage--;
      }
    });

    it('should page enable previous button after paging forward', () => {
      $(next).waitForDisplayed();

      let previousDisabled = $(previous).getAttribute('class').includes('disabled');
      expect(previousDisabled)
        .withContext(`Previous button should be disabled`)
        .toBe(true);

      $(next).click();

      previousDisabled = $(previous).getAttribute('class').includes('disabled');
      expect(previousDisabled)
        .withContext(`Previous button should be enabled`)
        .toBe(false);
    });

    it('should page backward', () => {
      $(next).click();

      const currentPage = $$('[data-qa-page-to]').filter(e => e.getAttribute('class').includes('disabled'))[0].getAttribute('data-qa-page-to');
      $(previous).click();

      const prevPage = parseInt($$('[data-qa-page-to]').filter(e => e.getAttribute('class').includes('disabled'))[0].getAttribute('data-qa-page-to'));
      expect(prevPage)
        .withContext(`Should only be one disabled button`)
        .toBe(1);
    });
  })

  describe('Ellipsis checks ', () => {

    it('should have one trailing ellipsis', () => {
      expect($(trailingEllip).isDisplayed())
        .withContext(`trailing ellipsis is not displayed`)
        .toBe(true)
      expect($$(trailingEllip).length)
        .withContext(`Should only be one trailing ellipsis`)
        .toEqual(1)
      expect($(leadingEllip).isDisplayed())
        .withContext(`Leading Ellipsis should not be displayed`)
        .toBe(false);
      expect($$(leadingEllip).length)
        .withContext(`Should only be one trailing ellipsis`)
        .toEqual(0)
    })

    it('should have a leading and trailing ellipsis', () => {
      $('[data-qa-page-to="5"]').waitForDisplayed();
      $('[data-qa-page-to="5"]').click();

      expect($(trailingEllip).isDisplayed())
        .withContext(`Trailing Ellipsis is not displayed`)
        .toBe(true);
      expect($(leadingEllip).isDisplayed())
        .withContext(`Leading Ellipsis is not displayed`)
        .toBe(true);

      $('[data-qa-page-to="6"]').click();

      expect($(trailingEllip).isDisplayed())
        .withContext(`Trailing Ellipsis is not displayed`)
        .toBe(true);
      expect($(leadingEllip).isDisplayed())
        .withContext(`Leading Ellipsis is not displayed`)
        .toBe(true);
    })

    it('should have one leading ellipsis', () => {
      $('[data-qa-page-to="5"]').waitForDisplayed();
      $('[data-qa-page-to="5"]').click();

      $('[data-qa-page-to="7"]').click();

      expect($(trailingEllip).isDisplayed())
        .withContext(`trailing ellipsis is displayed`)
        .toBe(false)
      expect($$(trailingEllip).length)
        .withContext(`Should only be one trailing ellipsis`)
        .toEqual(0)
      expect($(leadingEllip).isDisplayed())
        .withContext(`Leading Ellipsis should not be displayed`)
        .toBe(true);
      expect($$(leadingEllip).length)
        .withContext(`Should only be one trailing ellipsis`)
        .toEqual(1)
    })
  })
});
