const { constants } = require('../constants');

export default class Page {
    get dialogTitle() { return $('[data-qa-dialog-title]'); }
    get dialogContent() { return $('[data-qa-dialog-content]'); }
    get dialogConfirm() { return $('[data-qa-confirm-cancel]'); }
    get dialogConfirmDelete() { return $('[data-qa-confirm-delete]'); }
    get dialogConfirmCancel() { return $('[data-qa-cancel-delete]'); }
    get dialogCancel() { return $('[data-qa-cancel-cancel]'); }
    get sidebarTitle() { return $('[data-qa-sidebar-title]'); }
    get drawerTitle() { return $('[data-qa-drawer-title]'); }
    get drawerClose() { return $('[data-qa-close-drawer]'); }
    get docs() { return $$('[data-qa-doc]'); }
    get toast() { return $('[data-qa-toast]'); }
    get toastMsg() { return $('[data-qa-toast-message]'); }
    get userMenu() { return $('[data-qa-user-menu]'); }
    get logoutButton() { return $('[data-qa-menu-link="Log Out"]'); }
    get profileButton() { return $('[data-qa-menu-link="My Profile"]'); }
    get globalCreate() { return $('[data-qa-add-new-menu-button]'); }
    get addVolumeMenu() { return $('[data-qa-add-new-menu="Volume"]'); }
    get addLinodeMenu() { return $('[data-qa-add-new-menu="Linode"]'); }
    get addNodeBalancerMenu() { return $('[data-qa-add-new-menu="NodeBalancer"]'); }
    get notice() { return $('[data-qa-notice]'); }
    get notices() { return $$('[data-qa-notice]'); }
    get panels() { return $$('[data-qa-panel-summary]'); }
    get progressBar() { return $('[data-qa-circle-progress]'); }
    get actionMenu() { return $('[data-qa-action-menu]'); }
    get actionMenuItem() { return $('[data-qa-action-menu-item]'); }
    get selectOptions() { return $$('[data-qa-option]'); }
    get selectOption() { return $('[data-qa-option]') };
    get multiOption() { return $('[data-qa-multi-option]'); }
    get multiSelect() { return $('[data-qa-multi-select]'); }

    get tag() { return $('[data-qa-tag]'); }
    get tags() { return $$('[data-qa-tag]'); }
    get addTag() { return $('[data-qa-add-tag]'); }
    get deleteTag() { return $('[data-qa-delete-tag]'); }

    constructor() {
        this.pageTitle = 'Base page';
    }

    open(path) {

    }

    logout() {
        this.userMenu.waitForVisible(constants.wait.normal);
        this.userMenu.click();
        this.logoutButton.waitForVisible(constants.wait.normal);
        this.logoutButton.click();
        this.logoutButton.waitForVisible(constants.wait.normal, true);
        this.globalCreate.waitForVisible(constants.wait.normal, true);

        browser.waitUntil(function() {
            return browser.getUrl().includes('/login');
        }, constants.wait.normal, 'Failed to redirect to login page on log out');
    }

    chooseSelectOption(selectElement, selectOption) {
        selectElement.click();
        browser.waitForVisible('[data-value]');

        if (Number.isInteger(selectOption)) {
            const optionElement = $$('[data-value]')[selectOption];
            optionElement.click();
            optionElement.waitForVisible(constants.wait.normal, true);
            return;
        }

        $(`[data-value="${selectOption}"]`).click();
        browser.waitForVisible(`[data-value="${selectOption}"]`, constants.wait.normal, true);
    }

    expandPanel(title) {
        $(`[data-qa-panel-summary="${title}"]`).waitForVisible(constants.wait.normal);
        $(`[data-qa-panel-summary="${title}"]`).click();

        browser.waitUntil(function() {
            return $(`[data-qa-panel-summary="${title}"]`)
                .getAttribute('aria-expanded').includes('true');
        }, constants.wait.normal, 'Panel failed to expand');
    }

    expandPanels(numberOfPanels) {
        browser.waitUntil(function() {
            return $$('[data-qa-panel-summary]').length === numberOfPanels
        }, constants.wait.normal, 'Number of expected panels failed to display');
        
        this.panels.forEach(panel => {
            panel.click();
            // throttle expanding panels with a pause
            browser.pause(500);
        });

    }

    selectGlobalCreateItem(menuItem) {
        this.globalCreate.waitForVisible(constants.wait.normal);
        this.globalCreate.click();
        browser.waitForVisible('[data-qa-add-new-menu]', constants.wait.normal);
        browser.click(`[data-qa-add-new-menu="${menuItem}"]`);
        browser.waitForVisible('[data-qa-add-new-menu]', constants.wait.normal, true);
    }

    waitForNotice(noticeMsg, timeout=10000, opposite=false) {
        return browser.waitUntil(function() {
            const noticeRegex = new RegExp(noticeMsg, 'ig');
            const noticeMsgDisplays = $$('[data-qa-notice]')
                .filter(n => !!n.getText().match(noticeRegex));

            if (opposite) {
                return noticeMsgDisplays.length === 0;
            }

            return noticeMsgDisplays.length > 0;
        }, timeout, `${noticeMsg} failed to display after ${timeout}ms`);
    }

    assertDocsDisplay() {
        const sidebarTitle = this.sidebarTitle.getText();
        const docs = this.docs;
        expect(docs.length).toBe(2);
        expect(sidebarTitle).toBe('Linode Docs');
    }

    toastDisplays(expectedMessage, timeout=constants.wait.normal) {
        this.toast.waitForVisible(timeout);
        this.toastMsg.waitForVisible(timeout);
        
        const displayedMsg = browser.getText('[data-qa-toast-message]');
        expect(displayedMsg).toBe(expectedMessage);
        browser.click('[data-qa-toast] button');
        browser.waitForExist('[data-qa-toast]', constants.wait.short, true);
    }

    dismissToast() {
        return browser.waitUntil(function() {
            if (browser.isVisible('[data-qa-toast]')) {
                browser.click('[data-qa-toast] button');
                const dismissed = browser.isVisible('[data-qa-toast]') ? true : false;
                return dismissed;
            }
            return true;
        }, constants.wait.normal);
    }


    selectActionMenuItem(tableCell, item) {
        tableCell.$(this.actionMenu.selector).click();
        browser.waitForVisible('[data-qa-action-menu-item]', constants.wait.normal);
        browser.jsClick(`[data-qa-action-menu-item="${item}"]`);
    }

    closeDrawer() {
        this.drawerClose.click();
        this.drawerTitle.waitForVisible(constants.wait.normal, true);
    }

    changeTab(tab) {
        browser.jsClick(`[data-qa-tab="${tab}"]`);
        browser.waitUntil(function() {
            return browser
                .getAttribute(`[data-qa-tab="${tab}"]`, 'aria-selected').includes('true');
        }, constants.wait.normal, 'Failed to change tab');
        browser.waitForVisible('[data-qa-circle-progress]', constants.wait.normal, true);
        return this;
    }

    removeTag(label) {
        const matchingTags = this.tags.filter(t => t.getAttribute('data-qa-tag').includes(label));
        
        matchingTags.forEach(t => {
            const tagName = t.getText();
            t.$(this.deleteTag.selector).click();
            browser.waitForVisible(`[data-qa-tag="${tagName}"]`, constants.wait.normal, true);
        });
    }
}
