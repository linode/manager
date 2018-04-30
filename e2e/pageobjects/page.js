export default class Page {
    get sidebarTitle() { return $('[data-qa-sidebar-title]'); }
    get docs() { return $$('[data-qa-doc]'); }
    get toast() { return $('[data-qa-toast]'); }
    get toastMsg() { return $('[data-qa-toast-message]'); }

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
    }
}
