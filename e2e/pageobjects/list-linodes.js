import Page from './page';

export class ListLinodes extends Page {
    // Grid/List Linode Card/Rows
    get subheader() { return $('[data-qa-title]'); }
    get confirmDialogTitle() { return $('[data-qa-dialog-title]'); }
    get confirmDialogSubmit() { return $('[data-qa-confirm-cancel]'); }
    get confirmDialogCancel() { return $('[data-qa-cancel-cancel]'); }
    get placeholderText() { return $('[data-qa-placeholder-title]'); }
    get activeView() { return $('[data-qa-active-view]'); }
    get linodeElem() { return $('[data-qa-linode]'); }
    get linode() { return $$('[data-qa-linode]'); }
    get linodeElem() { return $('[data-qa-linode]'); }
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
    get powerOnMenu() { return $('[data-qa-action-menu-item="Power On"]'); }
    get launchConsoleMenu() { return $('[data-qa-action-menu-item="Launch Console"]'); }
    get rebootMenu() { return $('[data-qa-action-menu-item="Reboot"]'); }
    get viewGraphsMenu() { return $('[data-qa-action-menu-item="View Graphs"]'); }
    get resizeMenu() { return $('[data-qa-action-menu-item="Resize"]'); }
    get viewBackupsMenu() { return $('[data-qa-action-menu-item="View Backups"]'); }
    get settingsMenu() { return $('[data-qa-action-menu-item="Settings"]'); }
    get copyIp() { return $('[data-qa-copy-ip] svg'); }

    linodesDisplay() {
        try {
            browser.waitUntil(function() {
                return browser.waitForVisible('[data-qa-linode]') && $$('[data-qa-linode]').length > 0;
            }, 10000);
            return true;
        } catch (err) {
            if ($(this.placeholderText).isVisible()) {
                return false;
            }
            throw new Error(err);
        }
    }

    navigateToDetail(linode) {
        if(!linode) {
            this.linode[0].$(this.linodeLabel.selector).click();
            return;
        }
        linode.$(this.linodeLabel.selector).click();
    }

    gridElemsDisplay() {
        const header = this.subheader;
        this.linode.forEach(l => {
            expect(l.isVisible()).toBe(true);
            expect(l.$(this.linodeLabel.selector).isVisible()).toBe(true);
            expect(l.$(this.hardwareSummary.selector).isVisible()).toBe(true);
            expect(l.$(this.region.selector).isVisible()).toBe(true);
            expect(l.$(this.image.selector).isVisible()).toBe(true);
            expect(l.$(this.ip.selector).isVisible()).toBe(true);
            expect(l.$(this.rebootButton.selector).isVisible()).toBe(true);
            expect(l.$(this.linodeActionMenu.selector).isVisible()).toBe(true);
            expect(l.$(this.image.selector).isVisible()).toBe(true);
            expect(l.$(this.rebootButton.selector).isVisible()).toBe(true);
            expect(l.$(this.linodeActionMenu.selector).isVisible()).toBe(true);
        });

        expect(header.isVisible()).toBe(true);
        expect(header.getText()).not.toBe(null);
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

    getStatus(linode) {
        return linode.$(this.status.selector).getAttribute('data-qa-status');
    }

    reboot(linode) {
        const activeView = this.activeView.getAttribute('data-qa-active-view');

        if (activeView === 'list') {
            // Select from action menu
            linode.$(this.linodeActionMenu.selector).click();
            browser.click('[data-qa-action-menu-item="Reboot"]');
            this.acceptDialog('Confirm Reboot');
            browser.waitForVisible('[data-qa-loading]');
        }

        if (activeView === 'grid') {
            linode.$(this.rebootButton).click();
            this.acceptDialog('Confirm Reboot');
            browser.waitForVisible('[data-qa-circular-progress]');
        }
        
        browser.waitUntil(function() {
            return linode.$(this.status.selector).getAttribute('data-qa-status') === 'rebooting';
        }, 30000);
        
        browser.waitUntil(function() {
            return linode.$(this.status).getAttribute('data-qa-status') === 'running';
        }, 30000);
    }

    powerOff(linode) {
        linode.$(this.linodeActionMenu.selector).click();
        this.powerOffMenu.click();
        this.acceptDialog('Powering Down');
        
        browser.waitUntil(function() {
            return browser.isVisible('[data-qa-status="offline"]');
        }, 60000 * 3, 'Failed to power down linode');
    }

    powerOn(linode) {
        linode.$(this.linodeActionMenu.selector).click();
        this.powerOnMenu.click();

        browser.waitUntil(function() {
            return browser.isVisible('[data-qa-status="running"]');
        }, 60000 * 2);
    }

    shutdownIfRunning(linode) {
        if (this.getStatus(linode) === 'running') {
            this.powerOff(linode);
        }
    }

    selectMenuItem(linode, item) {
        if (this.getStatus(linode) === 'rebooting') {
            browser.waitForVisible('[data-qa-status="running"]', 45000);
        }
        linode.$(this.linodeActionMenu.selector).click();
        browser.jsClick(`[data-qa-action-menu-item="${item}"]`);
    }

    switchView(view) {
        browser.click(`[data-qa-view="${view}"]`);
        browser.waitUntil(function() {
            return browser.isVisible(`[data-qa-active-view="${view}"]`);
        }, 5000);
    }

    waitUntilBooted(label) {
        browser.waitForVisible('[data-qa-circle-progress]', 15000, true);
        browser.waitForVisible('[data-qa-loading="true"]', 30000, true);
        browser.waitForExist(`[data-qa-linode="${label}"] [data-qa-status="running"]`, 60000 * 2);
    }

    acceptDialog(dialogTitle) {
        this.confirmDialogTitle.waitForVisible();
        this.confirmDialogCancel.waitForVisible();
        this.confirmDialogSubmit.waitForVisible();
        expect(this.confirmDialogTitle.getText()).toBe(dialogTitle);
        this.confirmDialogSubmit.click();
        this.confirmDialogTitle.waitForVisible(10000, true);
    }

    assertDocsDrawer() {
        
    }

}
export default new ListLinodes();
