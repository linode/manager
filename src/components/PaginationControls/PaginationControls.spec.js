const { constants } = require('../../../e2e/constants');
const { waitForFocus } = require('../../../e2e/utils/storybook');

describe('Pagination Controls Suite', () => {
    const menuItem = '[data-name="Pagination Controls"]';
    const childMenuItems = ['[data-name="With even range."]', '[data-name="With odd range."]'];
    const previous = '[data-qa-previous-page]';
    const jumpToPage = page => `[data-qa-page-to="${page}"]`;
    const next = '[data-qa-next-page]';

    it('should display pagination controls in navigation', () => {
        const paginationMenuStory = $(menuItem);
        expect(paginationMenuStory.isVisible()).toBe(true);
    });

    it('should display pagination controls stories', () => {
        browser.click(menuItem);
        childMenuItems.forEach(e => browser.waitForVisible(e));
    });

    it('should display pagination controls in each story', () => {
        childMenuItems.forEach(story => {
            // Reset frame on each story
            browser.frame();
            browser.click(story);

            waitForFocus(next);

            const prevPageElem = $(previous);
            const nextPageElem = $(next);
            const availablePages = $$('[data-qa-page-to]');

            expect(prevPageElem.isVisible()).toBe(true);
            expect(nextPageElem.isVisible()).toBe(true);
            expect(availablePages.length).toBeGreaterThan(1);
        });
    });

    it('should default to page one', () => {
        childMenuItems.forEach(item => {
            browser.frame();
            browser.click(item);

            waitForFocus(next);
            const activePage = $$('[data-qa-page-to]').filter(e => e.getAttribute('class').includes('active'));

            expect(activePage.length).toBe(1);
            expect(activePage[0].getAttribute('data-qa-page-to')).toBe('1');
        });
    });

    it('should page forward through all', () => {
        childMenuItems.forEach(story => {
            // Reset frame on each story
            browser.frame();
            browser.click(story);

            waitForFocus(next);
            let currentPage = 1;

            const canPage = (nextOrPrevious) => {
                return !browser.getAttribute(nextOrPrevious, 'class').includes('disabled');
            }
            
            while(canPage(next)) {
                browser.click(next);                
                const activePages = $$('[data-qa-page-to]').filter(e => e.getAttribute('class').includes('active'));
                const newPageNumber = parseInt(activePages[0].getAttribute('data-qa-page-to'));

                expect(newPageNumber).toBe(currentPage + 1);
                currentPage++;
            }
        });
        
    });
    
    it('should page enable previous button after paging forward', () => {
        browser.url(constants.routes.storybook);
        browser.click(menuItem);

        childMenuItems.forEach(story => {
            //Reset frame on each story
            browser.frame();
            browser.click(story);

            waitForFocus(next);

            let previousDisabled = browser.getAttribute(previous, 'class').includes('disabled');
            expect(previousDisabled).toBe(true);
        
            browser.click(next);

            previousDisabled = browser.getAttribute(previous, 'class').includes('disabled');
            expect(previousDisabled).toBe(false);
        });
    });

    it('should page backward', () => {
        const currentPage = $$('[data-qa-page-to]').filter(e => e.getAttribute('class').includes('active'))[0].getAttribute('data-qa-page-to');
        browser.click(previous);

        const prevPage = parseInt($$('[data-qa-page-to]').filter(e => e.getAttribute('class').includes('active'))[0].getAttribute('data-qa-page-to'));
        expect(prevPage).toBe(1);
    });
});
