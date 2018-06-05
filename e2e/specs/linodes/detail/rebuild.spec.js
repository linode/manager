const { constants } = require('../../../constants');

import Rebuild from '../../../pageobjects/linode-detail/linode-detail-rebuild.page';
import ListLinodes from '../../../pageobjects/list-linodes';
import LinodeDetail from '../../../pageobjects/linode-detail/linode-detail.page';

describe('Linode Detail - Rebuild Suite', () => {
    beforeAll(() => {
        browser.url(constants.routes.linodes);

        ListLinodes.linodeElem.waitForVisible();
        ListLinodes.linode[0].$(ListLinodes.linodeLabel.selector).click();

        LinodeDetail.landingElemsDisplay();
        LinodeDetail.changeTab('Rebuild');
    });

    beforeEach(() => {
        browser.refresh();
        Rebuild.title.waitForText();
    });

    it('should display rebuild base elements', () => {
        Rebuild.assertElemsDisplay();
    });

    it('should display a help icon with tooltip on click', () => {
        Rebuild.help.click();
        Rebuild.popoverMsg.waitForVisible();

        expect(Rebuild.popoverMsg.getText()).toBe('Choosing a 64-bit distro is recommended.');
    });

    it('should display image options in the select', () => {
        Rebuild.imagesSelect.click();

        expect(Rebuild.imageSelectHeader.isVisible()).toBe(true);
        Rebuild.imageOptions.forEach(option => expect(option.isVisible()).toBe(true));
    });

    it('should display error on create an image without selecting an image', () => {
        browser.waitForVisible('[data-qa-image-option]', constants.wait.normal, true);
        
        Rebuild.submit.click();

        browser.waitForVisible('[data-qa-image-error]');
        const error = Rebuild.imageError;

        expect(error.getText()).toBe('Image cannot be blank.');
    });

    it('should display error on create image without setting a password', () => {
        Rebuild.selectImage();
        Rebuild.imageOptions.forEach(opt => opt.waitForVisible(constants.wait.short, true));
        Rebuild.submit.click();
    });

    it('should rebuild linode on valid image and password', () => {
        const testPassword = '~/4gNgmV$_J3vREN'
        Rebuild.selectImage();
        Rebuild.imageOptions.forEach(opt => opt.waitForVisible(constants.wait.short, true));
        Rebuild.password.setValue(testPassword);
        Rebuild.rebuild();
    });
});
