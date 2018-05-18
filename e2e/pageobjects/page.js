export default class Page {
    get sidebarTitle() { return $('[data-qa-sidebar-title]'); }
    get docs() { return $$('[data-qa-doc]'); }
    get toast() { return $('[data-qa-toast]'); }
    get toastMsg() { return $('[data-qa-toast-message]'); }
    get globalCreate() { return $('[data-qa-add-new-menu-button]'); }
    get addVolumeMenu() { return $('[data-qa-add-new-menu="Volume"]'); }
    get addLinodeMenu() { return $('[data-qa-add-new-menu="Linode"]'); }
    get addNodeBalancerMenu() { return $('[data-qa-add-new-menu="NodeBalancer"]'); }
    get notice() { return $('[data-qa-notice]'); }

    constructor() {
        this.pageTitle = 'Base page';
    }

    open(path) {

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
