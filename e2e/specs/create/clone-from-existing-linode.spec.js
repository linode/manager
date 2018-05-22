const { constants } = require('../../constants');

import { createGenericLinode } from '../../utils/common';
import ConfigureLinode from '../../pageobjects/configure-linode';
import Create from '../../pageobjects/create';

describe('Create Linode - Clone from Existing Suite', () => {
    beforeAll(() => {
        Create.menuButton.click();
        Create.linode();
    });

    it('should display clone elements', () => {
        ConfigureLinode.baseDisplay();
        ConfigureLinode.createFromExisting.click();
        ConfigureLinode.cloneBaseElemsDisplay();
    });

    it('should disable source linode in clone target panel on selection', () => {
        ConfigureLinode.cloneSelectSource();
    });

    it('should expand with clone to new linode elements', () => {
        ConfigureLinode.cloneSelectTarget();
    });

    xit('should disable all region options except the source linode region', () => {
        
    });

    xit('should fail to clone to a smaller linode plan', () => {
        const noticeMsg = 'The source Linode has allocated more disk than the new type allows. Delete/resize disks smaller or choose a larger type.';
        ConfigureLinode.selectPlanTab('Nanode');
        ConfigureLinode.selectPlan(0);
        ConfigureLinode.label.setValue(new Date().getTime());
        ConfigureLinode.regions[0].click();
        ConfigureLinode.deploy.click();
        ConfigureLinode.waitForNotice(noticeMsg);
    });
});
