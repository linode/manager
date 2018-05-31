const { constants } = require('../../constants');

import { apiCreateLinode, apiDeleteAllLinodes } from '../../utils/common';
import ConfigureLinode from '../../pageobjects/configure-linode';
import Create from '../../pageobjects/create';

describe('Create Linode - Clone from Existing Suite', () => {
    beforeAll(() => {
        apiCreateLinode();
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

    xit('should expand with clone to new linode elements', () => {
        ConfigureLinode.cloneSelectTarget();
    });

    xit('should disable all region options except the source linode region', () => {
        
    });

    it('should fail to clone to a smaller linode plan', () => {
        const noticeMsg = 'A plan selection is required when cloning to a new Linode';

        ConfigureLinode.selectPlanTab('Nanode');
        
        try {
            ConfigureLinode.selectPlan(0);
        } catch (err) {
            if (!err.Error.includes('Failed to select plan')) throw err;
        }

        ConfigureLinode.label.setValue(new Date().getTime());
        ConfigureLinode.regions[0].click();
        ConfigureLinode.deploy.click();
        ConfigureLinode.waitForNotice(noticeMsg);
    });

    afterAll(() => {
        apiDeleteAllLinodes();
    });
});
