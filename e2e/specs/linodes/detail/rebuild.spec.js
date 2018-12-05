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

    it('should display a help icon with tooltip on click', () => {
        Rebuild.helpButton.moveToObject();
        Rebuild.popoverMsg.waitForVisible(constants.wait.normal);
    });

    it('should display image options in the select', () => {
        Rebuild.imagesSelect.click();
        Rebuild.imageSelectHeader.waitForVisible(constants.wait.normal);

        // Only check two image Options for visibility
        expect(Rebuild.imageOptions[0].isVisible()).toBe(true);
        expect(Rebuild.imageOptions[1].isVisible()).toBe(true);
    });

    it('should display error on create an image without selecting an image', () => {
        browser.jsClick(Rebuild.submit.selector);
        expect(Rebuild.imageError.isVisible()).toBe(true);
        expect(Rebuild.imageError.getText()).toBe('Image cannot be blank.');
    });

    it('should display error on create image without setting a password', () => {
        const errorMsg = 'Password cannot be blank.';
        Rebuild.selectImage();
        browser.jsClick(Rebuild.submit.selector);
        Rebuild.waitForNotice(errorMsg, constants.wait.normal);
    });

    it('should rebuild linode on valid image and password', () => {
        const testPassword = generatePassword();
        Rebuild.password.setValue(testPassword);
        Rebuild.rebuild();
    });
});
