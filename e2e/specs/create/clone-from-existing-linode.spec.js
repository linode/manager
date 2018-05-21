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
        ConfigureLinode.cloneElemsDisplay();
    });

    it('should disable source linode in clone target panel on selection', () => {
        
    });

    it('should expand with clone to new linode elements', () => {
        
    });

    it('should disable all region options except the source linode region', () => {
        
    });

    it('should fail to clone to a smaller linode plan', () => {
        // select nanode
        // click deploy
        // assert a second data-qa-notice displays with message:
        // The source Linode has allocated more disk than the new type allows. Delete/resize disks smaller or choose a larger type.
    });
});
