import Page from '../page';

class Backups extends Page {
    get placeholderText() { return $('[data-qa-placeholder-title]'); }
    get enableButton() { return $('[data-qa-placeholder-button]'); }
    get heading() { return $('[data-qa-title]'); }
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
    get cancelButton() { return $('[data-qa-cancel]'); }
    get cancelDialogTitle() { return $('[data-qa-dialog-title]'); }
    get cancelConfirm() { return $('[data-qa-confirm-cancel]'); }
    get cancelDialogClose() { return $('[data-qa-cancel-cancel]'); }


    get backupInstances() { return $$('[data-qa-backup]'); }
    get label() { return $('[data-qa-backup-name]'); }
    get dateCreated() { return $('[data-qa-date-created]'); }
    get duration() { return $('[data-qa-backup-duration]'); }
    get disks() { return $('[data-qa-backup-disks]'); }
    get spaceRequired() { $('[data-qa-space-required]'); }

    baseElemsDisplay(backupsNotEnabled) {
        if (backupsNotEnabled) {
            this.placeholderText.waitForVisible();
            expect(this.enableButton.isVisible()).toBe(true);
            return;
        }

        this.manualDescription.waitForVisible();

        if (this.backupInstances.length < 1) {
            expect(this.description.isVisible()).toBe(true);
        }
        
        expect(this.heading.isVisible()).toBe(true);
        expect(this.manualSnapshotHeading.isVisible()).toBe(true);
        expect(this.manualDescription.isVisible()).toBe(true);
        expect(this.snapshotButton.isVisible()).toBe(true);
        expect(this.settingsHeading.isVisible()).toBe(true);
        expect(this.settingsDescription.isVisible()).toBe(true);
        expect(this.timedaySelect.isVisible()).toBe(true);
        expect(this.weekdaySelect.isVisible()).toBe(true);
        expect(this.saveScheduleButton.isVisible()).toBe(true);
        expect(this.cancelDescription.isVisible()).toBe(true);
        expect(this.cancelButton.isVisible()).toBe(true);
        expect(this.manualSnapshotName.isVisible()).toBe(true);
        expect(this.cancelButton.getAttribute('class')).toContain('destructive');
    }

    enableBackups() {
        const toastMsg = 'Backups are being enabled for this Linode';

        this.enableButton.click();
        browser.waitUntil(() => {
            if (browser.getText('[data-qa-toast-message]') === toastMsg) {
                browser.click('[data-qa-toast] button');
                return true;
            }
        }, 10000);
    }

    takeSnapshot(label) {
        const toastMsg = 'A snapshot is being taken';

        this.manualSnapshotName.$('input').setValue(label);
        this.snapshotButton.click();

        browser.waitForVisible('[data-qa-toast]');
        browser.waitUntil(function() {
            return browser
                .getText('[data-qa-toast-message]') === toastMsg;
        }, 10000);
        return this;
    }

    assertSnapshot(label) {
        browser.waitForVisible('[data-qa-backup]', 45000);

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
        this.cancelDialogTitle.waitForVisible();
        this.cancelConfirm.waitForVisible();
        this.cancelConfirm.click();

        const toastMsg = 'Backups are being cancelled for this Linode';
        this.toastDisplays(toastMsg);
    }
}

export default new Backups();
