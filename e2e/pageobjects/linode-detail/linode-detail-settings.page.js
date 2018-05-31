import Page from '../page';

class Settings extends Page {
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
    get selectDisk() { return $('[data-qa-select-disk]'); }
    get disk() { return $('[data-qa-disk]'); }
    get disks() { return $$('[data-qa-disk]'); }
    get password() { return $('[data-qa-hide] input'); }
    get passwordSave() { return $('[data-qa-password-save]'); }
    get alerts() { return $$('[data-qa-alert]'); }
    get alert() { return $('data-qa-alert] > input'); }
    get alertSave() { return $('[data-qa-alerts-save]'); }
    get linodeConfigs() { return $$('[data-qa-config]'); }
    get actionMenu() { return $('[data-qa-action-menu]'); }

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
        browser.waitForVisible(`[data-qa-config="${configLabel}"]`, 5000, true);
    }

    remove() {
        const linodeLabel = browser.getText('[data-qa-label]');
        const confirmTitle = 'Confirm Deletion';
        const confirmContent = 'Deleting a Linode will result in permenant data loss. Are you sure?';
        this.delete.click();
        this.deleteDialogTitle.waitForText();
        this.deleteDialogContent.waitForText();
        this.confirm.waitForVisible();
        this.cancel.waitForVisible();

        expect(this.confirm.getAttribute('class')).toContain('destructive');
        expect(this.deleteDialogTitle.getText()).toBe(confirmTitle);
        expect(this.deleteDialogContent.getText()).toBe(confirmContent);

        this.confirm.click();
        browser.waitForVisible('[data-qa-circle-progress]', 15000, true);
        
        browser.waitUntil(function() {
            if (browser.isVisible('[data-qa-placeholder-title]')) {
                return true;
            }

            if (browser.isVisible('[data-qa-view]')) {
                const labels = $$('[data-qa-label]').map(l => l.getText());
                return !labels.include(linodeLabel);
            }
            return false;
        }, 10000, 'Linode failed to be removed');
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
        this.disk.waitForVisible(5000, true);
        return disks;
    }

    resetPassword(newPassword, diskLabel) {
        const successMsg = 'Linode password changed successfully.';
        this.selectDisk.click();
        this.disk.waitForVisible();
        browser.jsClick(`[data-qa-disk="${diskLabel}"]`);

        this.disk.waitForVisible(5000, true);
        this.password.setValue(newPassword);
        this.passwordSave.click();

        this.waitForNotice(successMsg);
    }

    waitForNotice(noticeMsg) {
        browser.waitUntil(function() {
            browser.waitForVisible('[data-qa-notice');

            // Get all notices, since more than one may appear on the page
            const labelNotice = $$('[data-qa-notice]')
                .filter(n => n.getText().includes(noticeMsg));
            return labelNotice.length === 1;
        }, 10000);
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

}

export default new Settings();
