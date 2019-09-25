const { constants } = require('../constants');
const { assertLog } = require('../utils/assertionLog');

import Page from './page.js';

class NodeBalancers extends Page {
  get deploy() {
    return $('[data-qa-deploy-linode]');
  }
  get configTitle() {
    return this.pageTitle;
  }
  get placeholderText() {
    return $('[data-qa-placeholder-title]');
  }
  get placeholderButton() {
    return $('[data-qa-placeholder-button]');
  }
  get createNodeBalancerMenu() {
    return $('[data-qa-add-new-menu="NodeBalancer"]');
  }
  get createHeader() {
    return $('[data-qa-create-nodebalancer-header]');
  }

  get label() {
    return $('[data-qa-label-input] input');
  }
  get selectOption() {
    return $('[data-qa-option]');
  }

  get regionSection() {
    return $('[data-qa-tp="Region"]');
  }
  get regionSelect() {
    return $('[data-qa-enhanced-select="Regions"] input');
  }
  get regionError() {
    return $('#select-a-region-helper-text');
  }

  get connectionThrottleSection() {
    return $('[data-qa-throttle-section]');
  }
  get connectionThrottle() {
    return $('[data-qa-connection-throttle] input');
  }

  get settingsSection() {
    return $('[data-qa-nodebalancer-settings-section]');
  }
  get port() {
    return $('[data-qa-port] input');
  }
  get protocolSelect() {
    return $('[data-qa-protocol-select]');
  }
  get algorithmHeader() {
    return $('[data-qa-algorithm-header]');
  }
  get algorithmSelect() {
    return $('[data-qa-algorithm-select]');
  }

  get certTextField() {
    return $('[data-qa-cert-field]');
  }
  get privateKeyTextField() {
    return $('[data-qa-private-key-field]');
  }

  get sessionStickinessHeader() {
    return $('[data-qa-session-stickiness-header]');
  }
  get sessionStickiness() {
    return $('[data-qa-session-stickiness-select]');
  }

  get activeChecksHeader() {
    return $('[data-qa-active-checks-header]');
  }
  get activeCheckType() {
    return $('[data-qa-active-check-select]');
  }
  get activeCheckInterval() {
    return $('[data-qa-active-check-interval] input');
  }
  get activeCheckTimeout() {
    return $('[data-qa-active-check-timeout] input');
  }
  get activeCheckAttempts() {
    return $('[data-qa-active-check-attempts] input');
  }

  get passiveChecksHeader() {
    return $('[data-qa-passive-checks-header]');
  }
  get passiveChecksToggle() {
    return $('[data-qa-passive-checks-toggle]');
  }

  get backendIpsHeader() {
    return $('[data-qa-backend-ip-header]');
  }
  get backendIps() {
    return $$('[data-qa-backend-ip]');
  }
  get backendIpLabel() {
    return $('[data-qa-backend-ip-label] input');
  }
  get backendIpAddress() {
    return $('[data-qa-backend-ip-address] input');
  }
  get backendIpPort() {
    return $('[data-qa-backend-ip-port] input');
  }
  get backendIpWeight() {
    return $('[data-qa-backend-ip-weight] input');
  }
  get backendIpMode() {
    return $('[data-qa-backend-ip-mode]');
  }

  get saveButton() {
    return $('[data-qa-save-config]');
  }
  get deleteButton() {
    return $('[data-qa-delete-config]');
  }
  get nodes() {
    return $$('[data-qa-node]');
  }
  get removeNode() {
    return $('[data-qa-remove-node]');
  }
  get addNode() {
    return this.addIcon('Add a Node');
  }
  get addConfiguration() {
    return $('[data-qa-add-config]');
  }

  baseElemsDisplay(initial) {
    if (initial) {
      this.placeholderText.waitForDisplayed(constants.wait.normal);
      expect(this.placeholderButton.isDisplayed())
        .withContext(
          `"${this.placeholderButton.selector}" selector ${assertLog.displayed}`
        )
        .toBe(true);
      expect(this.placeholderButton.getTagName())
        .withContext(
          `${assertLog.incorrectTagName} "${
            this.placeholderButton.selector
          }" selector`
        )
        .toBe('button');
    } else {
      this.createHeader.waitForDisplayed();
      console.log('checking that region section is visible');
      expect(this.regionSection.isDisplayed())
        .withContext(
          `"${this.regionSection.selector}" selector ${assertLog.displayed}`
        )
        .toBe(true);
      console.log('checking that region select is visible');
      expect(this.regionSelect.isDisplayed())
        .withContext(
          `"${this.regionSelect.selector}" selector ${assertLog.displayed}`
        )
        .toBe(true);

      expect(this.settingsSection.isDisplayed())
        .withContext(
          `"${this.settingsSection.selector}" selector ${assertLog.displayed}`
        )
        .toBe(true);
      expect(this.port.isDisplayed())
        .withContext(`"${this.port.selector}" selector ${assertLog.displayed}`)
        .toBe(true);
      expect(this.protocolSelect.isDisplayed())
        .withContext(
          `"${this.protocolSelect.selector}" selector ${assertLog.displayed}`
        )
        .toBe(true);
      expect(this.algorithmSelect.getText())
        .withContext(
          `${assertLog.incorrectText} for "${
            this.algorithmSelect.selector
          }" selector`
        )
        .toContain('Round Robin');
      expect(this.sessionStickiness.getText())
        .withContext(
          `${assertLog.incorrectText} for "${
            this.sessionStickiness.selector
          }" selector`
        )
        .toContain('Table');

      expect(this.activeChecksHeader.isDisplayed())
        .withContext(
          `"${this.activeChecksHeader.selector}" selector ${
            assertLog.displayed
          }`
        )
        .toBe(true);
      expect(this.activeCheckType.isDisplayed())
        .withContext(
          `"${this.activeCheckType.selector}" selector ${assertLog.displayed}`
        )
        .toBe(true);
      // TODO waitForText is no longer a valid command
      // expect(this.passiveChecksHeader.waitForText())
      //   .withContext(
      //     `"${this.passiveChecksHeader.selector}" selector text ${
      //       assertLog.displayed
      //     }`
      //   )
      //   .toBe(true);
      expect(this.passiveChecksToggle.isDisplayed())
        .withContext(
          `"${this.passiveChecksToggle.selector}" selector ${
            assertLog.displayed
          }`
        )
        .toBe(true);
      // TODO waitForText is no longer a valid command
      // expect(this.backendIpsHeader.waitForText())
      //   .withContext(
      //     `"${this.backendIpsHeader.selector}" selector text ${
      //       assertLog.displayed
      //     }`
      //   )
      //   .toBe(true);
      expect(this.backendIpLabel.isDisplayed())
        .withContext(
          `"${this.backendIpLabel.selector}" selector ${assertLog.displayed}`
        )
        .toBe(true);
      expect(this.backendIpAddress.isDisplayed())
        .withContext(
          `"${this.backendIpAddress.selector}" selector ${assertLog.displayed}`
        )
        .toBe(true);
      expect(this.backendIpPort.isDisplayed())
        .withContext(
          `"${this.backendIpPort.selector}" selector ${assertLog.displayed}`
        )
        .toBe(true);
      expect(this.backendIpWeight.getValue())
        .withContext(
          `${assertLog.incorrectVal} fo "${
            this.backendIpWeight.selector
          }" selector `
        )
        .toBe('100');
    }
  }

  configElemsDisplay() {
    this.configTitle.waitForDisplayed(constants.wait.normal);
    console.log('Checking for NodeBalancer Configurations in the config title');
    expect(this.configTitle.getText())
      .withContext(
        `${assertLog.incorrectText} for "${this.configTitle.selector}" selector`
      )
      .toBe('NodeBalancer Configurations');
    console.log('Checking if the port input is visible');
    expect(this.port.isDisplayed())
      .withContext(`"${this.port.selector}" selector ${assertLog.displayed}`)
      .toBe(true);
    console.log('Checking if the protocol select input is visible');
    expect(this.protocolSelect.isDisplayed())
      .withContext(
        `"${this.protocolSelect.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    console.log(
      'Checking if the algorithm select dropdown contains Round Robin'
    );
    expect(this.algorithmSelect.getText())
      .withContext(
        `${assertLog.incorrectText} for "${
          this.algorithmSelect.selector
        }" selector`
      )
      .toContain('Round Robin');
    console.log(
      'Checking if the session stickiness select dropdown contains Table'
    );
    expect(this.sessionStickiness.getText())
      .withContext(`"${this.sessionStickiness.selector}" selector text`)
      .toContain('Table');
    console.log('Checking if the active checks input is visible');
    expect(this.activeChecksHeader.isDisplayed())
      .withContext(
        `"${this.activeChecksHeader.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    console.log('Checking if the active check type contains None');
    expect(this.activeCheckType.getText())
      .withContext(`"${this.activeCheckType.selector}" selector text`)
      .toContain('None');
    // TODO waitForText is no longer a valid command
    // expect(this.passiveChecksHeader.waitForText())
    //   .withContext(
    //     `"${this.passiveChecksHeader.selector}" selector text ${
    //       assertLog.displayed
    //     }`
    //   )
    //   .toBe(true);
    expect(
      this.passiveChecksToggle.getAttribute('data-qa-passive-checks-toggle')
    )
      .withContext(
        `${assertLog.incorrectAttr} "${
          this.passiveChecksToggle.selector
        }" selector`
      )
      .toBe('true');
    // TODO waitForText is no longer a valid command
    // expect(this.backendIpsHeader.waitForText())
    //   .withContext(
    //     `"${this.backendIpsHeader.selector}" selector text${
    //       assertLog.displayed
    //     }`
    //   )
    //   .toBe(true);
    expect(this.backendIpLabel.isDisplayed())
      .withContext(
        `"${this.backendIpLabel.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.backendIpAddress.isDisplayed())
      .withContext(
        `"${this.backendIpAddress.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.backendIpPort.isDisplayed())
      .withContext(
        `"${this.backendIpPort.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.backendIpWeight.getValue())
      .withContext(
        `${assertLog.incorrectVal} for "${
          this.backendIpWeight.selector
        }" selector`
      )
      .toBe('100');
    expect(this.backendIpMode.getText())
      .withContext(
        ` ${assertLog.incorrectText} for "${
          this.backendIpMode.selector
        }" selector`
      )
      .toContain('Accept');
    expect(this.addNode.isDisplayed())
      .withContext(`"${this.addNode.selector}" selector ${assertLog.displayed}`)
      .toBe(true);
    expect(this.addNode.getTagName())
      .withContext(
        `${assertLog.incorrectTagName} "${this.addNode.selector}" selector`
      )
      .toBe('button');
    expect(this.addConfiguration.getTagName())
      .withContext(
        `${assertLog.incorrectTagName} "${
          this.addConfiguration.selector
        }" selector`
      )
      .toBe('button');
    expect(this.addConfiguration.getText())
      .withContext(
        `${assertLog.incorrectText} for "${
          this.addConfiguration.selector
        }" selector`
      )
      .toBe('Add another Configuration');
    expect(this.removeNode.isDisplayed())
      .withContext(
        `"${this.removeNode.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
  }

  configDelete() {
    const confirmMsg =
      'Are you sure you want to delete this NodeBalancer Configuration?';
    this.deleteButton.click();
    this.dialogTitle.waitForDisplayed(constants.wait.normal);

    expect(this.dialogTitle.getText())
      .withContext(
        `"${this.dialogTitle.selector}" selector ${assertLog.displayed}`
      )
      .toMatch('Delete');
    expect(this.dialogContent.getText())
      .withContext(
        `${assertLog.incorrectText} for "${
          this.dialogContent.selector
        }" selector`
      )
      .toBe(confirmMsg);
    expect(this.dialogConfirm.getText())
      .withContext(
        `${assertLog.incorrectText} for "${
          this.dialogConfirm.selector
        }" selector `
      )
      .toBe('Delete');
    expect(this.dialogCancel.getText())
      .withContext(
        `${assertLog.incorrectText} for "${
          this.dialogCancel.selector
        }" selector`
      )
      .toBe('Cancel');

    this.dialogConfirm.click();
    this.dialogTitle.waitForDisplayed(constants.wait.normal, true);
    this.configTitle.waitForDisplayed(constants.wait.normal);

    expect(this.port.isDisplayed())
      .withContext(`"${this.port.selector}" selector ${assertLog.displayed}`)
      .toBe(false);
    expect(this.protocolSelect.isDisplayed())
      .withContext(
        `"${this.protocolSelect.selector}" selector ${assertLog.displayed}`
      )
      .toBe(false);
  }

  configAddNode(nodeConfig, type = 'creating') {
    this.addNode.click();
    this.backendIpLabel.waitForDisplayed(constants.wait.normal);
    this.backendIpAddress.waitForDisplayed(constants.wait.normal);
    this.backendIpLabel.click();
    this.backendIpLabel.setValue(nodeConfig.label);

    /** click the region where our Linode is located */
    if (type === 'creating') {
      $('[data-qa-select-card-subheading="Newark, NJ"]').click();
    }

    /** set the value of the ip address */
    this.backendIpAddress.setValue(nodeConfig.ip);

    /** wait for the dropdown options to appear */
    $('[data-qa-option]').waitForDisplayed(constants.wait.normal);

    /** press enter key which will select first value */
    browser.keys('\uE007');
  }

  configRemoveNode(nodeLabel) {
    const node = $$(this.backendIpLabel.selector).find(
      l => l.getValue() === nodeLabel
    );
    $(this.removeNode.selector).click();
    node.waitForDisplayed(constants.wait.normal, true);
  }

  configSave() {
    const successMsg = 'NodeBalancer Configuration updated successfully';
    this.saveButton.click();
    this.waitForNotice(successMsg);
  }

  create() {
    if (this.placeholderButton.isDisplayed()) {
      this.placeholderButton.click();
      this.baseElemsDisplay();
    } else {
      this.selectGlobalCreateItem('NodeBalancer');
    }
  }

  configure(
    linodeConfig,
    nodeBalancerConfig = {
      // NodeBalancer Config Object
      label: `NB-${new Date().getTime()}`,
      regionIndex: 0,
      connectionThrottle: 0,
      port: '80',
      protocol: 'http',
      algorithm: 'roundrobin',
      sessionStickiness: 'table',
      activeCheckType: 'TCP Connection',
      healthCheckInterval: 5,
      healthCheckTimeout: 3,
      healthCheckAttempts: 2,
      passiveChecksToggle: true
    }
  ) {
    this.label.waitForDisplayed(constants.wait.normal);
    this.label.setValue(nodeBalancerConfig.label);
    this.port.setValue(nodeBalancerConfig.port);
    this.selectMenuOption(
      this.protocolSelect.$('div'),
      nodeBalancerConfig.protocol
    );
    this.selectMenuOption(
      this.algorithmSelect.$('div'),
      nodeBalancerConfig.algorithm
    );
    this.selectMenuOption(
      this.sessionStickiness.$('div'),
      nodeBalancerConfig.sessionStickiness
    );
    this.backendIpLabel.setValue(linodeConfig.label);

    /** start backend ip selection */
    /** click the newark region because that's where our Linode is located */
    NodeBalancers.regionSelect.setValue('us-east');
    browser.keys('\uE007');

    /** set the value of the IP Address field */
    const privateIP = linodeConfig.ipv4.find(eachIP => eachIP.match(/192.168/));
    this.backendIpAddress.setValue(privateIP);

    /** wait for the dropdown options to appear */
    $('[data-qa-option]').waitForDisplayed(constants.wait.normal);

    /** press enter key which will select first value */
    browser.keys('\uE007');

    this.backendIpPort.setValue(80);
    browser.jsClick('[data-qa-deploy-linode]');
  }

  selectMenuOption(select, optionName) {
    select.click();
    this.selectOption.waitForDisplayed(constants.wait.normal);
    $(`[data-qa-option=${optionName}]`).click();
    $(`[data-qa-option=${optionName}]`).waitForDisplayed(
      constants.wait.normal,
      true
    );
  }
}

export default new NodeBalancers();
