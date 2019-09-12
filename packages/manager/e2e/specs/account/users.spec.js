// const { constants } = require('../../constants');

// import Users from '../../pageobjects/account/users.page';
// import Permissions from '../../pageobjects/account/permissions.page'

// describe('Account - Users Suite', () => {

//     const userConfig = {
//         username: `test-user${new Date().getTime()}`,
//         email: `pthiel@linode.com`
//     }

//     beforeAll(() => {
//         browser.url(constants.routes.account.users);
//     });

//     it('should display users page base elements', () => {
//         Users.baseElementsDisplay();
//     });

//     it('should display root user in the table', () => {
//         const rootUserName = Users.getTableDetails(undefined,Users.username.selector,browser.options.testUser);
//         const rootUserRestrictions = Users.getTableDetails(0,Users.userRestriction.selector);
//         expect(rootUserName).toBeTruthy();
//         expect(rootUserRestrictions.getText()).toMatch(/Full/ig);
//     });

//     it('should disable Delete action menu item for root user', () => {
//         const rootUserActionMenu = Users.getTableDetails(0,Users.userActionMenu.selector);
//         rootUserActionMenu.click();
//         Users.actionMenuItem.waitForVisible(constants.wait.normal);

//         const deleteToolTip = $('[data-qa-action-menu-item="Delete"] [data-qa-tooltip]');

//         expect(deleteToolTip.isVisible()).toBe(false);
//         expect(deleteToolTip.isExisting()).toBe(true);

//         browser.click('body');
//         Users.actionMenuItem.waitForExist(constants.wait.normal, true);
//     });

//     it('should not allow current user to change their permissions', () => {
//         Users.viewPermissions(browser.options.testUser);

//         Permissions.baseElementsDisplay(false);
//         expect(Permissions.restrictAccessToggle.$('input').getAttribute('disabled')).toBe('true');
//         expect(Permissions.restrictAccessTooltip.isVisible()).toBe(true);

//         Permissions.restrictAccessTooltip.moveToObject();
//         Permissions.popoverMsg.waitForVisible(constants.wait.normal);
//         expect(Permissions.popoverMsg.getText()).toEqual('You cannot restrict the current active user.');

//         //Navigate back to the users page for subsequent tests
//         Users.userDetailHeader.click();
//         Users.baseElementsDisplay();
//     });

//     describe('Account - Unrestricted User Suite', () => {

//         it('should create a new unrestricted user', () => {
//             Users.add(userConfig);
//         });

//         it('should display user action menu items', () => {
//             Users.getTableDetails(undefined, Users.actionMenu.selector, userConfig.username).click();
//             Users.actionMenuItem.waitForVisible(constants.wait.normal);

//             expect($('[data-qa-action-menu-item="User Profile"]').isVisible()).toBe(true);
//             expect($('[data-qa-action-menu-item="User Permissions"]').isVisible()).toBe(true);
//             expect($('[data-qa-action-menu-item="Delete"]').isVisible()).toBe(true);
//             expect($('[data-qa-action-menu-item="Delete"]').isEnabled()).toBe(true);

//             browser.click('body');

//             Users.actionMenuItem.waitForExist(constants.wait.normal, true);
//         });

//         it('should delete the new unrestricted user', () => {
//             Users.delete(userConfig);
//         });
//     });
// });
