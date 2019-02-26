const { navigateToStory } = require('../../../e2e/utils/storybook');

describe('Pagination Controls Suite', () => {
    const previous = '[data-qa-page-previous]';
    const next = '[data-qa-page-next]';
    const component = 'Pagination Controls';
    const childStory = 'Interactive example';

    const getPageControl = (page) => {
        return $(`[data-qa-page-to="${page}"]`);
    };

    //expected postion index plus 1
    const ellipsis = (page) => {
        page+=1;
        const index = page.toString();
        return $(`#root>div>div:nth-child(${index})`)
    };

    beforeAll(() => {
        navigateToStory(component, childStory);
    });

    it('The pagination control is disabled for the active page', () => {
        expect(getPageControl('1').getAttribute('disabled')).not.toBeNull();
        expect(getPageControl('2').getAttribute('disabled')).toBeNull();
        getPageControl('2').click();
        expect(getPageControl('2').getAttribute('disabled')).not.toBeNull();
        expect(getPageControl('1').getAttribute('disabled')).toBeNull();
    });

    it('The next and previous page button work as ', () => {
        $(previous).click();
        expect(getPageControl('1').getAttribute('disabled')).not.toBeNull();
        $(next).click();
        expect(getPageControl('2').getAttribute('disabled')).not.toBeNull();
    });

    it('There should be an ellipsis', () => {
        expect(ellipsis(6).isVisible()).toBe(true);
        getPageControl('5').click();
        browser.pause(500);
        expect(ellipsis(2).isVisible() && ellipsis(8).isVisible()).toBe(true);
        getPageControl('10').click();
        browser.pause(500);
        expect(ellipsis(2).isVisible()).toBe(true);
    });
});
