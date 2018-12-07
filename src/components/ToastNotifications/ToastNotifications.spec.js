const { navigateToStory } = require('../../../e2e/utils/storybook');
const { constants } = require('../../../e2e/constants');

describe('Toast Notification Suite', () => {
    const component = 'Toast Notification';
    const childStory = 'Default';
    const variants = ['success', 'warning', 'error', 'info'];
    const toast = '[data-qa-toast] div';

    const notificationButton = (state) => {
        const button = $$('#root>[type="button"]').find(button => button.getText() === state);
        button.waitForVisible(constants.wait.normal);
        return button;
    }

    beforeAll(() => {
        navigateToStory(component, childStory);
    });

    it('Toast notification displays with expected variant', () => {
        variants.forEach((variant) => {
            notificationButton(variant).click();
            $(toast).waitForVisible(constants.wait.normal);
            expect($(toast).getAttribute('class')).toContain(`SnackBar-${variant}`);
            $(toast).waitForVisible(constants.wait.normal, true);
        });
        notificationButton('default').click();
        $(toast).waitForVisible(constants.wait.normal);
        expect($(toast).getAttribute('class')).not.toContain('variant');
        $(toast).waitForVisible(constants.wait.normal, true);
    });

    it('Toast notification dissapears after 4 seconds', () => {
        notificationButton(variants[0]).click();
        browser.pause(4500);
        expect($(toast).isVisible()).toBe(false);
    });

    it('No more than 3 notifications display at once', () => {
        notificationButton(variants[0]).click();
        notificationButton(variants[1]).click();
        notificationButton(variants[1]).click();
        notificationButton(variants[1]).click();
        browser.pause(500);
        const successIsNull = $$(toast).find(toast => toast.getAttribute('class').includes('SnackBar-success'));
        expect(successIsNull).toEqual(undefined);
    });
});
