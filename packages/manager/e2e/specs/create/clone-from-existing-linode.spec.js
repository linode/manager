const { constants } = require('../../constants');

import { apiCreateLinode, apiDeleteAllLinodes } from '../../utils/common';
import ConfigureLinode from '../../pageobjects/configure-linode';
import Create from '../../pageobjects/create';

describe('Create Linode - Clone from Existing Suite', () => {
    beforeAll(() => {
        apiCreateLinode(undefined,undefined,undefined,'g6-standard-1');
        ConfigureLinode.selectGlobalCreateItem('Linode');
    });

    afterAll(() => {
       apiDeleteAllLinodes();
   });

    it('should display clone elements', () => {
        ConfigureLinode.baseDisplay();
        ConfigureLinode.createFromMyImage.click();
        ConfigureLinode.createFromClone.click();
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
            $$('[data-qa-tp="Linode Plan"] [data-qa-selection-card]')[0].click();
            browser.waitForVisible('[role="tooltip"]');
            const toolTipMsg = browser.getText('[role="tooltip"]');
            expect(toolTipMsg).toBe('This plan is too small for the selected image.');
        } catch (err) {
            if (!err.message.includes('Failed to select plan')) throw err;
        }

        ConfigureLinode.label.setValue(new Date().getTime());
        ConfigureLinode.regions[0].click();
        ConfigureLinode.deploy.click();
        ConfigureLinode.waitForNotice(noticeMsg);
    });
});
