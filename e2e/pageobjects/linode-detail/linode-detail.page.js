const { constants } = require('../../constants');

import Page from '../page';

class LinodeDetail extends Page {
    get title() { return $('[data-qa-title]'); }
    get summaryTab() { return $('[data-qa-tab="Summary"]'); }
    get volumesTab() { return $('[data-qa-tab="Volumes"]'); }
    get networkingTab() { return $('[data-qa-tab="Networking"]'); }
    get resizeTab() { return $('[data-qa-tab="Resize"]'); }
    get rescueTab() { return $('[data-qa-tab="Rescue"]'); }
    get rebuildTab() { return $('[data-qa-tab="Rebuild"]'); }
    get backupTab() { return $('[data-qa-tab="Backups"]'); }
    get settingsTab() { return $('[data-qa-tab="Settings"]'); }
    get launchConsole() { return $('[data-qa-launch-console]'); }
    get powerControl() { return $('[data-qa-power-control]'); }
    get setPowerReboot() { return $('[data-qa-set-power="reboot"]'); }
    get setPowerOff() { return $('[data-qa-set-power="powerOff"]'); }
    get setPowerOn() { return $('[data-qa-set-power="powerOn"]'); }
    get linodeLabel() { return $('[data-qa-label]'); }
    get editLabel() { return $('[data-qa-edit-button]'); }

    changeName(name) {
        this.linodeLabel.waitForVisible();
        this.editLabel.click();
        browser.setValue('[data-qa-label] input', name);
        browser.click('[data-qa-save-edit]');
        browser.waitUntil(function() {
            return this.linodeLabel.getText() === name;
        }, constants.wait.normal);
    }

    setPower(powerState) {
        const currentPowerState = this.powerControl.getAttribute('data-qa-power-control');

        browser.jsClick('[data-qa-power-control]');
        browser.click(`[data-qa-set-power="${powerState}"]`);

        if (powerState.includes('powerOff')) {
            this.dialogTitle.waitForVisible(constants.wait.normal);
            browser.click('[data-qa-confirm-cancel]');
            browser.waitUntil(function() {
                return browser.isVisible('[data-qa-power-control="offline"]');
            }, constants.wait.minute * 3);
            return;
        }
    }

    landingElemsDisplay() {
        this.summaryTab.waitForVisible();

        expect(this.title.isVisible()).toBe(true);
        expect(this.volumesTab.isVisible()).toBe(true);
        expect(this.networkingTab.isVisible()).toBe(true);
        expect(this.resizeTab.isVisible()).toBe(true);
        expect(this.rescueTab.isVisible()).toBe(true);
        expect(this.rebuildTab.isVisible()).toBe(true);
        expect(this.backupTab.isVisible()).toBe(true);
        expect(this.settingsTab.isVisible()).toBe(true);
        expect(this.launchConsole.isVisible()).toBe(true);
        expect(this.powerControl.isVisible()).toBe(true);
        expect(this.linodeLabel.isVisible()).toBe(true);

        return this;
    }
}

export default new LinodeDetail();
