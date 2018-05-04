import Page from './page';

class Create extends Page {
    get menuButton() { return $('[data-qa-add-new-menu-button]'); }
    get linodeMenuItem() { return $('[data-qa-add-new-menu="Linode"]'); }
    get volumeMenuItem() { return $('[data-qa-add-new-menu="Volume"]'); }
    get nodeBalancerMenuItem() { return $('[data-qa-add-new-menu="Volume"]'); }
    get selectionCards () { return $$('[SelectionCard-heading-321]'); }

    linode() {
        browser.waitForVisible('[data-qa-add-new-menu="Linode"]');
        this.linodeMenuItem.click();
    }

    volume() {
        browser.waitForVisible('[data-qa-add-new-menu="Volume"]');
        this.volumeMenuItem.click();
    }

    nodebalancer() {
        browser.waitForVisible('[data-qa-add-new-menu="NodeBalancer"]');
        this.nodeBalancerMenuItem.click();
    }
}

export default new Create();
