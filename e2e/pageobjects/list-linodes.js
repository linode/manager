import Page from './page';

export class ListLinodes extends Page {
    // Grid/List Linode Card/Rows
    get subheader() { return $('[data-qa-title]'); }
    get activeView() { return $('[data-qa-active-view]'); }
    get linode() { return $$('[data-qa-linode]'); }
    get linodeLabel() { return $('[data-qa-label]'); }
    get hardwareSummary() { return $('[data-qa-linode-summary]'); }
    get region() { return $('[data-qa-region]'); }
    get ip() { return $('[data-qa-ips]'); }
    get image() { return $('[data-qa-image]'); }
    get launchConsole() { return $('[data-qa-console]'); }
    get rebootButton() { return $('[data-qa-reboot]'); }
    get linodeActionMenu() { return $('[data-qa-action-menu]'); }
    get listToggle() { return $('[data-qa-view="list"]'); }
    get gridToggle() { return $('[data-qa-view="grid"]'); }
    get status() { return $('[data-qa-status]') }
    get tableHead() { return $('[data-qa-table-head]'); }

    // Action Menu Items
    get powerOffMenu() { return $('[data-qa-action-menu-item="Power Off"]'); } 
    get launchConsoleMenu() { return $('[data-qa-action-menu-item="Launch Console"]'); }
    get rebootMenu() { return $('[data-qa-action-menu-item="Reboot"]'); }
    get viewGraphsMenu() { return $('[data-qa-action-menu-item="View Graphs"]'); }
    get resizeMenu() { return $('[data-qa-action-menu-item="Resize"]'); }
    get viewBackupsMenu() { return $('[data-qa-action-menu-item="View Backups"]'); }
    get settingsMenu() { return $('[data-qa-action-menu-item="Settings"]'); }
    get copyIp() { return $('[data-qa-copy-ip]'); }


    gridElemsDisplay() {
        const header = this.subheader;
        const linodeDisplays = this.linode.map(l => l.isVisible());
        const labelDisplays = this.linode.map(l => l.$(this.linodeLabel.selector).isVisible());
        const hardwareSummaryDisplays = this.linode.map(l => l.$(this.hardwareSummary.selector).isVisible());
        const regionDisplays = this.linode.map(l => l.$(this.region.selector).isVisible());
        const imageDisplays = this.linode.map(l => l.$(this.image.selector).isVisible());
        const ipDisplays = this.linode.map(l => l.$(this.ip.selector).isVisible());
        const rebootButtonDisplays = this.linode.map(l => l.$(this.rebootButton.selector).isVisible());
        const launchConsoleDisplays = this.linode.map(l => l.$(this.linodeActionMenu.selector).isVisible());

        expect(header.isVisible()).toBe(true);
        expect(header.getText()).not.toBe(null);
        linodeDisplays.forEach(l => expect(l).toBe(true));
        labelDisplays.forEach(l => expect(l).toBe(true));
        hardwareSummaryDisplays.forEach(l => expect(l).toBe(true));
        regionDisplays.forEach(l => expect(l).toBe(true));
        imageDisplays.forEach(l => expect(l).toBe(true));
        ipDisplays.forEach(l => expect(l).toBe(true));
        rebootButtonDisplays.forEach(l => expect(l).toBe(true));
        launchConsoleDisplays.forEach(l => expect(l).toBe(true));
    }
    listElemsDisplay() {
        const linodeDisplays = this.linode.map(l => l.isVisible());
        const labelDisplays = this.linode.map(l => l.$(this.linodeLabel.selector).isVisible());
        const ipDisplays = this.linode.map(l => l.$(this.ip.selector).isVisible());
        const regionDisplays = this.linode.map(l => l.$(this.region.selector).isVisible());
        const actionMenu =  this.linode.map(l => l.$(this.linodeActionMenu.selector).isVisible());

        linodeDisplays.forEach(l => expect(l).toBe(true));
        labelDisplays.forEach(l => expect(l).toBe(true));
        ipDisplays.forEach(i => expect(i).toBe(true));
        regionDisplays.forEach(r => expect(r).toBe(true));
        actionMenu.forEach(a => expect(a).toBe(true));
    }

    reboot(linode) {
        const activeView = this.activeView.getAttribute('data-qa-active-view');

        if (activeView === 'list') {
            // Select from action menu
            linode.$(this.linodeActionMenu.selector).click();
            browser.click('[data-qa-action-menu-item="Reboot"]');
            browser.waitForVisible('[data-qa-loading]');
        }

        if (activeView === 'grid') {
            linode.$(this.rebootButton).click();
            browser.waitForVisible('[data-qa-circular-progress]');
        }
        browser.waitUntil(function() {
            return linode.$(this.status.selector).getAttribute('data-qa-status') === 'rebooting';
        }, 30000);
        browser.waitUntil(function() {
            return linode.$(this.status).getAttribute('data-qa-status') === 'running';
        }, 30000);
    }

    boot(linode) {

    }

    selectMenuItem(linode, item) {
        linode.$(this.linodeActionMenu.selector).click();
        browser.click(`[data-qa-action-menu-item="${item}"]`);
    }

    switchView(view) {
        browser.click(`[data-qa-view="${view}"]`);
        browser.waitUntil(function() {
            return browser.isVisible(`[data-qa-active-view="${view}"]`);
        }, 5000);
    }

    assertDocsDrawer() {
        
    }

}
export default new ListLinodes();
