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

    it('should display error on create an image without selecting an image', () => {
        Rebuild.submit.click();
        expect(Rebuild.imageError.isVisible()).toBe(true);
        expect(Rebuild.imageError.getText()).toBe('Image cannot be blank.');
        browser.refresh();
        Rebuild.assertElemsDisplay();
    });

    it('should display error on create image without setting a password', () => {
        const errorMsg = 'Password cannot be blank.';
        Rebuild.selectImage();
        Rebuild.imageOption.waitForVisible(constants.wait.normal,true);
        Rebuild.submit.click();
        Rebuild.waitForNotice(errorMsg, constants.wait.normal);
        browser.refresh();
        Rebuild.assertElemsDisplay();
    });

    it('should rebuild linode on valid image and password', () => {
        const testPassword = generatePassword();
        Rebuild.selectImage();
        Rebuild.password.setValue(testPassword);
        Rebuild.rebuild();
    });
});
