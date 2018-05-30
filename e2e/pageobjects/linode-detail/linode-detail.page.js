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
    get editLabel() { return $('[data-qa-label] button'); }

    changeTab(tab) {
        browser.jsClick(`[data-qa-tab="${tab}"]`);
        browser.waitUntil(function() {
            return browser
                .getAttribute(`[data-qa-tab="${tab}"]`, 'aria-selected').includes('true');
        }, 5000, 'Failed to change tab');
        browser.waitForVisible('[data-qa-circle-progress]', 10000, true);
        return this;
    }

    changeName(name) {
        this.linodeLabel.waitForVisible();
        this.editLabel.click();
        browser.setValue('[data-qa-edit-field] input', name);
        browser.click('[data-qa-save-edit]');
        browser.waitUntil(function() {
            return this.linodeLabel.getText() === name;
        }, 5000);
    }

    setPower(powerState) {
        const currentPowerState = this.powerControl.getAttribute('data-qa-power-control');

        this.powerControl.click();
        powerState.click();
        
        browser.waitUntil(function() {
            return
                this.powerControl.isEnabled() &&
                this.powerControl.getAttribute('data-qa-power-control') !== currentPowerState;
        }, 20000);
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
