import Page from './page';

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

    get backupInstances() { return $$('[data-qa-backup]'); }
    get label() { return $('[data-qa-backup-name]'); }
    get dateCreated() { return $('[data-qa-date-created]'); }
    get duration() { return $('[data-qa-backup-duration]'); }
    get disks() { return $('[data-qa-backup-disks]'); }
    get spaceRequired() { $('[data-qa-space-required]'); }

    takeSnapshot(label) {
        this.manualSnapshotName.$('input').setValue(label);
        this.snapshotButton.click();

        browser.waitForVisible('[data-qa-toast]');
        browser.waitUntil(function() {
            return browser
                .getText('[data-qa-toast-message]') === 'A snapshot is being taken';
        }, 10000);
    }

    assertSnapshot(label) {
        browser.waitForVisible('[data-qa-backup]');

        const backupInstance = this.backupInstances.map(i => {
            return i.$(this.name.selector).getText();
        });
        expect(backupInstance).toContain(label);
    }

    scheduleSnapshots(dayTime, weekDay) {
        this.timedaySelect.selectByVisibleText(dayTime);
        this.weekdaySelect.selectByVisibleText(weekDay);
        this.saveScheduleButton.click();
    }

    cancelBackups() {
        this.cancelButton.click();
        
        browser.waitForVisible('[data-qa-toast]');
        browser.waitUntil(function() {
            return browser
                .getText('[data-qa-toast]') === 'Backups are being cancelled for this Linode';
        }, 10000);

        this.placeholderText.waitForVisible();
    }
}

export default new Backups();
