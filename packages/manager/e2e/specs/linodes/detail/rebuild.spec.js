const { constants } = require('../../../constants');

import { apiCreateLinode, apiDeleteAllLinodes, generatePassword } from '../../../utils/common';
import Rebuild from '../../../pageobjects/linode-detail/linode-detail-rebuild.page';
import ListLinodes from '../../../pageobjects/list-linodes';
import LinodeDetail from '../../../pageobjects/linode-detail/linode-detail.page';

describe('Linode Detail - Rebuild Suite', () => {
    beforeAll(() => {
        browser.url(constants.routes.linodes);
        apiCreateLinode();

        ListLinodes.linodeElem.waitForVisible();
        ListLinodes.navigateToDetail();

        LinodeDetail.landingElemsDisplay();
        LinodeDetail.changeTab('Rebuild');
    });

    afterAll(() => {
        apiDeleteAllLinodes();
    });

    it('should display rebuild base elements', () => {
        Rebuild.assertElemsDisplay();
    });

    it('should display a helper text for rebuilding a linode', () => {
        const message = "If you can't rescue an existing disk, it's time to rebuild your Linode. There are a couple of different ways you can do this: either restore from a backup or start over with a fresh Linux distribution. Rebuilding will destroy all data.";
        expect(Rebuild.rebuildDescriptionText.getText()).toBe(message);
    });

    it('should display the option to rebuild from image or stackscript', () => {
        Rebuild.rebuildSelect.click();
        browser.pause(500);
        const rebuildOptions = Rebuild.selectOptions.map(options => options.getText());
        expect(rebuildOptions.sort()).toEqual(
            [
                'From Account StackScript',
                'From Community StackScript',
                'From Image',
            ]
        );
        $('body').click();
    });

    it('should display error on create an image without selecting an image', () => {
        Rebuild.submit.click();
        browser.waitForVisible(Rebuild.rebuildConfirmModalButton.selector)
        Rebuild.rebuildConfirmModalButton.click();
        Rebuild.waitForNotice('An image is required.', constants.wait.normal);
        browser.refresh();
        Rebuild.assertElemsDisplay();
    });

    it('should display error on create image without setting a password', () => {
        const errorMsg = 'Password cannot be blank.';
        Rebuild.selectImage();
        Rebuild.imageOption.waitForVisible(constants.wait.normal, true);
        Rebuild.submit.click();
        browser.waitForVisible(Rebuild.rebuildConfirmModalButton.selector)
        Rebuild.rebuildConfirmModalButton.click();
        Rebuild.waitForNotice(errorMsg, constants.wait.normal);
        browser.refresh();
        Rebuild.assertElemsDisplay();
    });

    it('should rebuild linode on valid image and password', () => {
        const testPassword = generatePassword();
        Rebuild.selectImage('Arch');
        Rebuild.password.setValue(testPassword);
        Rebuild.rebuild();
    });
});
