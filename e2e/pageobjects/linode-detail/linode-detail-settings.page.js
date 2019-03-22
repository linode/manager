const { constants } = require('../../constants');
const {
    generatePassword,
    getDistributionLabel
 } = require('../../utils/common')

import Page from '../page';

class Settings extends Page {
    get header() { return $('[data-qa-settings-header]'); }
    get actionPanels() { return $$('[data-qa-panel-summary]'); }
    get actionPanelSubheading() { return $('[data-qa-panel-subheading]'); }
    get delete() { return $('[data-qa-delete-linode]'); }
    get deleteDialogTitle() { return $('[data-qa-dialog-title]'); }
    get deleteDialogContent() { return $('[data-qa-dialog-content]'); }
    get confirm() { return $('[data-qa-confirm-delete]'); }
    get cancel() { return $('[data-qa-cancel-delete]'); }
    get label() { return $('[data-qa-label] input'); }
    get labelSave() { return $('[data-qa-label-save]'); }
    get notice() { return $('[data-qa-notice]'); }
    get notices() { return $$('[data-qa-notice]'); }
    get selectDisk() {
        return $$('[data-qa-enhanced-select]')
            .find(s => s.getAttribute('data-qa-enhanced-select').includes('Disk'));
    }
    get disk() { return $('[data-qa-disk]'); }
    get disks() { return $$('[data-qa-disk]'); }
    get passwordSave() { return $('[data-qa-password-save]'); }
    get alerts() { return $$('[data-qa-alert]'); }
    get alert() { return $('data-qa-alert] > input'); }
    get alertSave() { return $('[data-qa-alerts-save]'); }
    get linodeConfigs() { return $$('[data-qa-config]'); }
    get actionMenu() { return $('[data-qa-action-menu]'); }
    get watchdogPanel() { return $('[data-qa-watchdog-panel]'); }
    get watchdogToggle() { return $('[data-qa-watchdog-toggle]'); }
    get watchdogDesc() { return $('[data-qa-watchdog-desc]'); }

    //Add disk drawer
    get createEmptyDisk() { return $('[data-qa-radio="Create Empty Disk"]'); }
    get createFromImage() { return $('[data-qa-radio="Create from Image"]'); }
    get diskLabelInput() { return $(`${this.drawerBase.selector} [data-qa-label] input`); }
    get diskSizeInput() { return $('[data-qa-disk-size]'); }
    get addDiskButton() { return $('[data-qa-disk-submit]'); }
    get password() { return $('[data-qa-password-input] input'); }


    addDiskDrawerDisplays(){
        this.drawerBase.waitForVisible(constants.wait.normal);
        this.createEmptyDisk.waitForVisible(constants.wait.normal);
        this.createFromImage.waitForVisible(constants.wait.normal);
        this.diskLabelInput.waitForVisible(constants.wait.normal);
        this.diskSizeInput.waitForVisible(constants.wait.normal);
        this.addDiskButton.waitForVisible(constants.wait.normal);
    }

    addDisk(diskLabel){
      let i = 0;
        do {
            this.addDiskButton.click();
            browser.pause(2000);
            i++;
        } while ($('[data-qa-error]').isVisible() && i < 10);
        this.drawerBase.waitForVisible(constants.wait.normal,true);
        this.diskRow(diskLabel).waitForVisible(constants.wait.normal);
    }

    diskRow(diskLabel){
        return $(`[data-qa-disk="${diskLabel}"]`);
    }

    addEmptyDisk(diskLabel,diskSize){
        this.diskLabelInput.setValue(diskLabel);
        this.diskSizeInput.$('input').setValue(diskSize);
        this.addDisk(diskLabel);
    }

    addDiskFromImage(diskLabel, imageId, diskSize){
        this.createFromImage.click();
        const imagePassword = $(`${this.drawerBase.selector} ${this.password.selector}`);
        imagePassword.waitForVisible(constants.wait.normal);
        const imageSelect = $('[data-qa-enhanced-select="Select an Image"] input');
        imageSelect.waitForVisible(constants.wait.normal);
        this.diskLabelInput.setValue(diskLabel);
        imageSelect.click();
        const displayImage = getDistributionLabel([imageId])[0];
        imageSelect.setValue(displayImage);
        const imageSelection = `[data-qa-option="linode/${imageId}"]`;
        $(imageSelection).waitForVisible(constants.wait.normal);
        $(imageSelection).click();
        $(imageSelection).waitForVisible(constants.wait.normal,true);
        imagePassword.setValue(generatePassword());
        this.diskSizeInput.$('input').setValue(diskSize);
        browser.pause(1000);
        this.addDisk(diskLabel);
    }

    getConfigLabels() {
        return this.linodeConfigs.map(c => c.getAttribute('data-qa-config'));
    }

    deleteConfig(configLabel) {
        const confirmMsg = `Are you sure you want to delete "${configLabel}"`;

        browser.click(`[data-qa-config="${configLabel}"] [data-qa-action-menu]`);
        browser.waitForVisible('[data-qa-action-menu-item]');

        // Click action menu item, regardless of anything blocking it
        browser.jsClick('[data-qa-action-menu-item="Delete"]');
        browser.waitForVisible('[data-qa-dialog-title]');
        browser.waitForVisible('[data-qa-dialog-content]');

        expect(browser.getText('[data-qa-dialog-content]')).toBe(confirmMsg);

        this.confirm.waitForVisible();
        this.cancel.waitForVisible();
        this.confirm.click();
        browser.waitForVisible(`[data-qa-config="${configLabel}"]`, constants.wait.short, true);
    }

    remove() {
        /** linode label sourced from the editable text H1 in the header */
        const linodeLabel = browser.getText('[data-qa-editable-text]');
        const confirmTitle = `Confirm Deletion of ${linodeLabel}`;
        const confirmContent = 'Deleting a Linode will result in permanent data loss. Are you sure?';
        this.delete.click();
        this.deleteDialogTitle.waitForText();
        this.deleteDialogContent.waitForText();
        this.confirm.waitForVisible();
        this.cancel.waitForVisible();

        expect(this.deleteDialogTitle.getText()).toBe(confirmTitle);
        expect(this.deleteDialogContent.getText()).toBe(confirmContent);

        this.confirm.click();
        browser.waitForVisible('[data-qa-circle-progress]', constants.wait.normal, true);
    }

    updateLabel(label) {
        const successMsg = 'Linode label changed successfully.';
        this.label.waitForVisible();
        this.label.setValue(label);
        this.labelSave.click();
        this.waitForNotice(successMsg);
    }

    getDiskLabels() {
        this.selectDisk.click();
        this.disk.waitForVisible();
        const disks = this.disks.map(d => d.getText());
        // Refactor this to use the actions api when chrome supports
        browser.keys('\uE00C');
        this.disk.waitForVisible(constants.wait.short, true);
        return disks;
    }

    resetPassword(newPassword, diskLabel='none') {
        const successMsg = 'Linode password changed successfully.';

        if (diskLabel !== 'none') {
            this.selectDisk.click();
            this.disk.waitForVisible();
            browser.jsClick(`[data-qa-disk="${diskLabel}"]`);
            this.disk.waitForVisible(constants.wait.short, true);
        }

        this.password.setValue(newPassword);
        this.passwordSave.click();

        this.waitForNotice(successMsg, constants.wait.long);
    }

    allAlertsEnabled() {
        const checkedAlerts = $$('[data-qa-alert] :checked');
        const alerts = $$('[data-qa-alert]');
        expect(checkedAlerts.length).toBe(checkedAlerts.length);
        expect(alerts.length).toBe(5);
    }

    toggleAlert(alert) {
        const successMsg = 'Linode alert thresholds changed successfully.';
        browser.click(`[data-qa-alert="${alert}"]`);
        this.alertSave.click();
        this.waitForNotice(successMsg);
    }

    toggleWatchdog(powerState) {
        const originalState = this.watchdogToggle.getAttribute('data-qa-watchdog-toggle');
        expect(originalState).toBe(powerState === 'on' ? 'false' : 'true');
        this.watchdogToggle.click();
        this.waitForNotice(`Watchdog succesfully ${powerState === 'on' ? 'enabled' : 'disabled'}`);
        const afterClick = this.watchdogToggle.getAttribute('data-qa-watchdog-toggle');
        expect(afterClick).toBe(powerState === 'on' ? 'true' : 'false');
    }


}

export default new Settings();
