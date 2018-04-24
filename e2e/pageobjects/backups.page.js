import Page from './page';

class Backups extends Page {
    get placeholderText() { return $('[data-qa-placeholder-title]'); }
    get enableButton() { return $('[data-qa-placeholder-button]'); }
    get heading() { return $(); }
    get description() { return $(); }
    get manualSnapshotHeading() { return $(); }
    get manualDescription() { return $(); }
    get manualSnapshotName() { return $(); }
    get snapshotButton() { return $(); }
    get settingsHeading() { return $(); }
    get settingsDescription() { return $(); }
    get timedaySelect() { return $(); }
    get weekdaySelect() { return $(); }
    get saveScheduleButton() { return $(); }
    get cancelButton() { return $(); }


    takeSnapshot(label) {
        // wait for toast with message: "a snapshot is being taken"
    }

    assertSnapshot(label) {
        // assert snapshot with 'label' displays in table
    }

    scheduleSnapshots(dayTime, weekDay) {
        this.timedaySelect.selectByVisibleText(dayTime);
        this.weekdaySelect.selectByVisibleText(weekDay);
        this.saveScheduleButton.click();
    }

    cancelBackups() {
        this.cancelButton.click();
        this.placeholderText.waitForVisible(10000, true);
    }
}

export default new Backup();
