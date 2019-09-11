const { constants } = require('../../constants');
import Page from '../page';

class StackScriptDetail extends Page {
  get stackScriptTitleElement() {
    return $('[data-qa-stack-title]');
  }
  get stackScriptAuthorElement() {
    return $('[data-qa-stack-author]');
  }
  get stackScriptDeployments() {
    return $('[data-qa-stack-deployments]');
  }
  get deployStackScriptButton() {
    return $('[data-qa-stack-deploy]');
  }
  get stackScriptDescription() {
    return $('[data-qa-stack-description]');
  }
  get compatibleDistributions() {
    return $('[data-qa-compatible-distro]');
  }
  get stackScriptCode() {
    return $('[data-qa-script-code]');
  }
  get stackScript() {
    return $$('[data-qa-script]');
  }

  stackScriptDetailPageDisplays() {
    this.breadcrumbBackLink.waitForDisplayed(constants.wait.normal);
    this.breadcrumbStaticText.waitForDisplayed(constants.wait.normal);
    this.deployStackScriptButton.waitForDisplayed(constants.wait.normal);
    this.stackScriptDetailDisplays();
  }

  stackScriptDetailDrawerDisplays() {
    this.drawerBase.waitForDisplayed(constants.wait.normal);
    this.drawerTitle.waitForDisplayed(constants.wait.normal);
    this.stackScriptDetailDisplays();
  }

  stackScriptDetailDisplays() {
    this.stackScriptTitleElement.waitForDisplayed(constants.wait.normal);
    this.stackScriptAuthorElement.waitForDisplayed(constants.wait.normal);
    this.stackScriptDeployments.waitForDisplayed(constants.wait.normal);
    this.compatibleDistributions.waitForDisplayed(constants.wait.normal);
    this.stackScriptCode.waitForDisplayed(constants.wait.normal);
  }

  stackScriptTitle(stackScriptTitle) {
    const selector = this.stackScriptTitleElement.selector.replace(']', '');
    return $(`${selector}="${stackScriptTitle}"]`);
  }

  stackScriptAuthor(stackScriptAuthor) {
    const selector = this.stackScriptAuthorElement.selector.replace(']', '');
    return $(`${selector}="${stackScriptAuthor}"]`);
  }

  getStackScriptCompatibleDistributions() {
    this.compatibleDistributions.waitForDisplayed(constants.wait.normal);
    const distroListText = this.compatibleDistributions.getText();
    const cleanText = distroListText.replace('Compatible with: ', '');
    return cleanText.split(',').map(distro => distro.trim());
  }

  getStackScriptCode() {
    return this.stackScript.map(script => script.getText());
  }
}

export default new StackScriptDetail();
