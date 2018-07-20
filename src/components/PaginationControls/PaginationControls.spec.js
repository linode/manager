// const { executeInAllStories } = require('../../../e2e/utils/storybook');

// describe('Pagination Controls Suite', () => {
//     const component = 'Pagination Controls';
//     const childStories = [
//         'With even range.',
//         'With odd range.',
//     ]
//     const previous = '[data-qa-previous-page]';
//     const jumpToPage = page => `[data-qa-page-to="${page}"]`;
//     const next = '[data-qa-next-page]';

//     it.skip('should display pagination controls in each story', () => {
//         executeInAllStories(component, childStories, () => {
//             browser.waitForVisible(next);

//             const prevPageElem = $(previous);
//             const nextPageElem = $(next);
//             const availablePages = $$('[data-qa-page-to]');

//             expect(prevPageElem.isVisible()).toBe(true);
//             expect(nextPageElem.isVisible()).toBe(true);
//             expect(availablePages.length).toBeGreaterThan(1);
//         });
//     });

//     it.skip('should default to page one', () => {
//         executeInAllStories(component, childStories, () => {
//             browser.waitForVisible(next);
//             const activePage = $$('[data-qa-page-to]').filter(e => e.getAttribute('class').includes('active'));

//             expect(activePage.length).toBe(1);
//             expect(activePage[0].getAttribute('data-qa-page-to')).toBe('1');
//         });
//     });

//     it.skip('should page forward through all', () => {
//         executeInAllStories(component, childStories, () => {
//             browser.waitForVisible(next);
//             let currentPage = 1;

//             const canPage = (nextOrPrevious) => {
//                 return !browser.getAttribute(nextOrPrevious, 'class').includes('disabled');
//             }

//             while(canPage(next)) {
//                 browser.click(next);
//                 const activePages = $$('[data-qa-page-to]').filter(e => e.getAttribute('class').includes('active'));
//                 const newPageNumber = parseInt(activePages[0].getAttribute('data-qa-page-to'));

//                 expect(newPageNumber).toBe(currentPage + 1);
//                 currentPage++;
//             }
//         });

//     });

//     it.skip('should page enable previous button after paging forward', () => {
//         executeInAllStories(component, childStories, () => {
//             browser.waitForVisible(next);

//             let previousDisabled = browser.getAttribute(previous, 'class').includes('disabled');
//             expect(previousDisabled).toBe(true);

//             browser.click(next);

//             previousDisabled = browser.getAttribute(previous, 'class').includes('disabled');
//             expect(previousDisabled).toBe(false);
//         });
//     });

//     it.skip('should page backward', () => {
//         const currentPage = $$('[data-qa-page-to]').filter(e => e.getAttribute('class').includes('active'))[0].getAttribute('data-qa-page-to');
//         browser.click(previous);

//         const prevPage = parseInt($$('[data-qa-page-to]').filter(e => e.getAttribute('class').includes('active'))[0].getAttribute('data-qa-page-to'));
//         expect(prevPage).toBe(1);
//     });
// });
