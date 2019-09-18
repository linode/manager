const { constants } = require('../../constants');
const { getImages } = require('../../setup/setup');

import ConfigureImage from '../../pageobjects/configure-image.page';

import {
  apiCreateLinode,
  apiDeleteAllLinodes,
  apiDeletePrivateImages
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
    ConfigureImage.placeholderMsg.waitForDisplayed(constants.wait.normal);
    ConfigureImage.placeholderButton.waitForDisplayed(constants.wait.normal);
    ConfigureImage.placeholderButton.click();
    ConfigureImage.baseElementsDisplay();
  });

  xit('should configure the image', () => {
    const imageConfig = {
      label: 'my-test-image',
      description: 'some image description!'
    };
    ConfigureImage.configure(imageConfig);
  });

  xit('should schedule the image for creation', () => {
    ConfigureImage.create();
  });
});
