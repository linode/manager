const { constants } = require('../../constants');

import SshKeys from '../../pageobjects/profile/ssh-keys.page';
import ConfigureLinode from '../../pageobjects/configure-linode';
import ListLinodes from '../../pageobjects/list-linodes';
import {
  apiDeleteAllLinodes,
  apiRemoveSshKeys,
  waitForLinodeStatus
} from '../../utils/common';

describe('Profile - SSH Keys Suite', () => {
  const testKey = {
    label: 'Test-SSH-Key',
    publicKey: constants.testPublicKey
  };

  beforeAll(() => {
    browser.url(constants.routes.profile.sshKeys);
  });

  it('should display the ssh keys base elements', () => {
    SshKeys.baseElemsDisplay();
  });

  it('should successfully add a valid ssh public key', () => {
    SshKeys.addKey(testKey.label, testKey.publicKey);
  });

  describe('Linode - Create From SSH Key Suite', () => {
    beforeAll(() => {
      browser.url(constants.routes.create.linode);
    });

    it('should display the available ssh keys on image selection', () => {
      ConfigureLinode.baseDisplay();
      ConfigureLinode.images[0].click();
      ConfigureLinode.sshHeader.waitForVisible(constants.wait.normal);
      expect(ConfigureLinode.sshKeys.length).toBe(1);
    });

    it('should fail to deploy without entering a password and selecting an ssh key', () => {
      const errorMsg =
        'Password must contain at least 2 of these 4 character classes: lowercase letters, uppercase letters, numbers, and punctuation';

      ConfigureLinode.regions[0].click();
      ConfigureLinode.plans[0].click();
      ConfigureLinode.deploy.click();
      ConfigureLinode.waitForNotice(errorMsg, constants.wait.normal);
    });

    it('should deploy linode with SSH key', () => {
      const linodeLabel = `Test-Linode${new Date().getTime()}`;
      ConfigureLinode.label.setValue(linodeLabel);
      ConfigureLinode.randomPassword();
      ConfigureLinode.sshKeys[0].$('input').click();
      ConfigureLinode.deploy.click();
      waitForLinodeStatus(linodeLabel, 'running');
    });
  });

  it('should remove the ssh key', () => {
    browser.url(constants.routes.profile.sshKeys);
    SshKeys.baseElemsDisplay();
    SshKeys.publicKeyRow.waitForVisible(constants.wait.normal);
    SshKeys.removeKey(testKey.label);
  });

  afterAll(() => {
    apiDeleteAllLinodes();
    apiRemoveSshKeys();
  });
});
