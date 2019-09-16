const { constants } = require('../../constants');
const { assertLog } = require('../../utils/assertionLog');

import Page from '../page';

class Rescue extends Page {
  get addDisk() {
    return this.addIcon('Add Disk');
  }

  rescueDetailDisplays() {
    this.pageTitle.waitForDisplayed(constants.wait.normal);
    this.addDisk.waitForDisplayed(constants.wait.normal);
    this.submitButton.waitForDisplayed(constants.wait.normal);
    $(this.basicSelect).waitForDisplayed(constants.wait.normal);
    expect(this.pageTitle.getText())
      .withContext(
        `${assertLog.incorrectText} "${this.pageTitle.selector}" selector`
      )
      .toBe('Rescue');
  }

  rescueDiskSelect(disk) {
    return $(`[for="rescueDevice_${disk}"]`)
      .$('..')
      .$(`${this.basicSelect} div`);
  }

  openRescueDiskSelect(disk) {
    this.rescueDiskSelect(disk).click();
    const selectionsMenu = $(`#menu-rescueDevice_${disk}`);
    selectionsMenu.waitForDisplayed(constants.wait.normal);
  }

  selectDiskOrVlolume(disk, selection) {
    this.openRescueDiskSelect(disk);
    const select = this.selectOption.selector.replace(']', '');
    browser.jsClick(`${select}="${selection}"]`);
    $(`#menu-rescueDevice_${disk}`).waitForDisplayed(
      constants.wait.normal,
      true
    );
  }
}

export default new Rescue();
