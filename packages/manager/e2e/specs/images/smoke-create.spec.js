const { constants } = require('../../constants');
const { getImages } = require('../../setup/setup');

import ConfigureImage from '../../pageobjects/configure-image.page';

import {
    apiCreateLinode,
    apiDeleteAllLinodes,
    apiDeletePrivateImages,
} from '../../utils/common';

describe('Images - Create Suite', () => {
    beforeAll(() => {
        apiCreateLinode();
        browser.url(constants.routes.images);
    });

    afterAll(() => {
        apiDeleteAllLinodes();
        apiDeletePrivateImages(browser.readToken(browser.options.testUser));
    });

    it('should display create image drawer', () => {
        ConfigureImage.placeholderMsg.waitForVisible(constants.wait.normal);
        ConfigureImage.placeholderButton.waitForVisible(constants.wait.normal);
        ConfigureImage.placeholderButton.click();
        ConfigureImage.baseElementsDisplay();
    });

    it('should configure the image', () => {
        const imageConfig = {
            label: 'my-test-image',
            description: 'some image description!'
        }
        ConfigureImage.configure(imageConfig);
    });

    it('should schedule the image for creation', () => {
        ConfigureImage.create();
    });
});
