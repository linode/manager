export default class Page {
    get sidebarTitle() { return $('[data-qa-sidebar-title]'); }
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

    constructor() {
        this.pageTitle = 'Base page';
    }

    open(path) {

    }

    logout() {
        this.userMenu.waitForVisible();
        this.userMenu.click();
        this.logoutButton.waitForVisible();
        this.logoutButton.click();
        this.logoutButton.waitForVisible(5000, true);
        this.globalCreate.waitForVisible(5000, true);

        browser.waitUntil(function() {
            return browser.getUrl().includes('/login');
        }, 10000, 'Failed to redirect to login page on log out');
    }

    waitForNotice(noticeMsg) {
        return browser.waitUntil(function() {
            const noticeRegex = new RegExp(noticeMsg, 'ig');
            console.log(noticeRegex);
            const noticeMsgDisplays = $$('[data-qa-notice]')
                .filter(n => !!n.getText().match(noticeRegex));
            console.log(noticeMsgDisplays);
            return noticeMsgDisplays.length > 0;
        }, 10000);
    }

    assertDocsDisplay() {
        const sidebarTitle = this.sidebarTitle.getText();
        const docs = this.docs;
        expect(docs.length).toBe(2);
        expect(sidebarTitle).toBe('Linode Docs');
    }

    toastDisplays(expectedMessage) {
        this.toast.waitForVisible();
        this.toastMsg.waitForVisible();
        
        const displayedMsg = browser.getText('[data-qa-toast-message]');
        expect(displayedMsg).toBe(expectedMessage);
        browser.click('[data-qa-toast] button');
        browser.waitForExist('[data-qa-toast]', 5000, true);
    }

    dismissToast() {
        return browser.waitUntil(function() {
            if (browser.isVisible('[data-qa-toast]')) {
                browser.click('[data-qa-toast] button');
                const dismissed = browser.isVisible('[data-qa-toast]') ? true : false;
                return dismissed;
            }
            return true;
        }, 10000);
    }
}
