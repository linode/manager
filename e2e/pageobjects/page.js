export default class Page {
    get sidebarTitle() { return $('[data-qa-sidebar-title]'); }
    get docs() { return $$('[data-qa-doc]'); }

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

}
