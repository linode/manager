const { constants } = require('../../constants');

import Page from '../page';

class Rescue extends Page {
    get addDisk() { return this.addIcon('Add Disk'); }

    rescueDetailDisplays(){
        this.pageTitle.waitForVisible(constants.wait.normal);
        this.addDisk.waitForVisible(constants.wait.normal);
        this.submitButton.waitForVisible(constants.wait.normal);
        $(this.basicSelect).waitForVisible(constants.wait.normal);
        expect(this.pageTitle.getText()).toBe('Rescue');
    }

    rescueDiskSelect(disk){
        return $(`[for="rescueDevice_${disk}"]`).$('..').$(`${this.basicSelect} div`);
    }

    openRescueDiskSelect(disk){
        this.rescueDiskSelect(disk).click();
        const selectionsMenu = $(`#menu-rescueDevice_${disk}`);
        selectionsMenu.waitForVisible(constants.wait.normal);
    }

    selectDiskOrVlolume(disk,selection){
        this.openRescueDiskSelect(disk);
        const select = this.selectOption.selector.replace(']','');
        browser.jsClick(`${select}="${selection}"]`);
        $(`#menu-rescueDevice_${disk}`).waitForVisible(constants.wait.normal,true);
    }
}

export default new Rescue();
