const { constants } = require('../../constants');

import Page from '../page';

class Backups extends Page {
    get placeholderText() { return $('[data-qa-placeholder-title]'); }
    get enableButton() { return $('[data-qa-placeholder-button]'); }
    get heading() { return this.pageTitle; }
    get description() { return $('[data-qa-backup-description]'); }
    get manualSnapshotHeading() { return $('[data-qa-manual-heading]'); }
    get manualDescription() { return $('[data-qa-manual-desc]'); }
    get manualSnapshotName() { return $('[data-qa-manual-name]'); }
    get snapshotButton() { return $('[data-qa-snapshot-button]'); }
    get settingsHeading() { return $('[data-qa-settings-heading]'); }
    get settingsDescription() { return $('[data-qa-settings-desc]'); }
    get timedaySelect() { return $('[data-qa-time-select]'); }
    get weekdaySelect() { return $('[data-qa-weekday-select]'); }
    get saveScheduleButton() { return $('[data-qa-schedule]'); }
    get cancelDescription() { return $('[data-qa-cancel-desc]'); }
    get cancelDialogTitle() { return $('[data-qa-dialog-title]'); }
    get cancelConfirm() { return $('[data-qa-confirm-cancel]'); }
    get cancelDialogClose() { return $('[data-qa-cancel-cancel]'); }


    get firstBackupRow() { return $('[data-qa-backup]'); }
    get backupInstances() { return $$('[data-qa-backup]'); }
    get label() { return $('[data-qa-backup-name]'); }
    get dateCreated() { return $('[data-qa-date-created]'); }
    get duration() { return $('[data-qa-backup-duration]'); }
    get disks() { return $('[data-qa-backup-disks]'); }
    get spaceRequired() { return $('[data-qa-space-required]'); }

    get restoreToLinodeSelect() { return $('[data-qa-select-linode]'); }
    get restoreToLinodesOptions() { return $$('[data-qa-option]'); }
    get overwriteLinodeCheckbox() { return $(`${this.drawerBase.selector} [data-qa-checked]`); }
    get restoreSubmit() { return $('[data-qa-restore-submit]'); }
    get restoreCancel() { return $('[data-qa-restore-cancel]'); }

    baseElemsDisplay(backupsNotEnabled) {
        if (backupsNotEnabled) {
            this.placeholderText.waitForDisplayed(constants.wait.normal);
            expect(this.enableButton.isDisplayed()).toBe(true);
            return;
        }

        this.manualDescription.waitForDisplayed();

        if (this.backupInstances.length < 1) {
            expect(this.description.isDisplayed()).toBe(true);
        }

        expect(this.heading.isDisplayed()).toBe(true);
        expect(this.manualSnapshotHeading.isDisplayed()).toBe(true);
        expect(this.manualDescription.isDisplayed()).toBe(true);
        expect(this.snapshotButton.isDisplayed()).toBe(true);
        expect(this.settingsHeading.isDisplayed()).toBe(true);
        expect(this.settingsDescription.isDisplayed()).toBe(true);
        expect(this.timedaySelect.isDisplayed()).toBe(true);
        expect(this.weekdaySelect.isDisplayed()).toBe(true);
        expect(this.saveScheduleButton.isDisplayed()).toBe(true);
        expect(this.cancelDescription.isDisplayed()).toBe(true);
        expect(this.cancelButton.isDisplayed()).toBe(true);
        expect(this.manualSnapshotName.isDisplayed()).toBe(true);
        // expect(this.cancelButton.getAttribute('class')).toContain('destructive');
    }

    restoreToExistingDrawerDisplays() {
        this.restoreToLinodeSelect.waitForDisplayed(constants.wait.normal);
        this.overwriteLinodeCheckbox.waitForDisplayed(constants.wait.normal);
        this.restoreSubmit.waitForDisplayed(constants.wait.normal);
        this.restoreCancel.waitForDisplayed(constants.wait.normal);
    }

    enableBackups() {
        const toastMsg = 'Backups are being enabled for this Linode';
        this.enableButton.waitForDisplayed(constants.wait.normal);
        this.enableButton.click();
        this.toastDisplays(toastMsg);
    }

    takeSnapshot(label) {
        const toastMsg = 'A snapshot is being taken';
        this.manualSnapshotName.$('input').setValue(label);
        this.snapshotButton.click();
        this.toastDisplays(toastMsg, constants.wait.long);
    }

    takeSnapshotWaitForComplete(label) {
        this.takeSnapshot(label);
        this.linearProgress.waitForDisplayed(constants.wait.normal);
        this.linearProgress.waitForDisplayed(constants.wait.minute*5,true);
        browser.waitUntil(() => {
            return $$(this.label.selector).find( backup => backup.getText() === label )
        },constants.wait.normal);
    }

    assertSnapshot(label) {
        $('[data-qa-backup]').waitForDisplayed(constants.wait.veryLong);

        const backupInstance = this.backupInstances.map(i => {
            return i.$(this.label.selector).getText();
        });
        expect(backupInstance).toContain(label);
        return this;
    }

    scheduleSnapshots(dayTime, weekDay) {
        this.timedaySelect.selectByVisibleText(dayTime);
        this.weekdaySelect.selectByVisibleText(weekDay);
        this.saveScheduleButton.click();
    }

    cancelBackups() {
        this.cancelButton.click();
        this.cancelDialogTitle.waitForDisplayed();
        this.cancelConfirm.waitForDisplayed();
        this.cancelConfirm.click();

        const toastMsg = 'Backups are being cancelled for this Linode';
        this.toastDisplays(toastMsg);
    }
}

export default new Backups();
