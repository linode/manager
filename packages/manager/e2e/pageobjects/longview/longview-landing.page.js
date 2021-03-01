const { assertLog } = require('../../utils/assertionLog');
const { constants } = require('../../constants');
import Page from '../page';

class LongviewLanding extends Page {
  get title() {
    return $('h1');
  }

  get clientsTab() {
    return $('[data-qa-tab="Clients"]');
  }

  get planDetailsTab() {
    return $('[data-qa-tab="Plan Details"]');
  }

  get apiKey() {
    return $('[data-testid="api-key"]');
  }

  get addClient() {
    return $('[data-qa-icon-text-link="Add a Client"]');
  }

  get longviewClient() {
    return $('[data-testid="installation"]');
  }

  get longviewClients() {
    return $$('[data-testid="installation"]');
  }

  get deleteClientKabob() {
    return $('[data-testid="installation"] [data-qa-action-menu]');
  }

  get deleteButton() {
    return $('[data-qa-action-menu-item="Delete"]');
  }

  get lvDelete() {
    return $('[data-testid="delete-button"]');
  }

  get noLVClients() {
    return $('[data-testid="no-client-list"]');
  }

  get maxClientDialog() {
    return $('[data-qa-dialog-title="Maximum Clients Reached"]');
  }

  get upgradeText() {
    return $('[data-testid="longview-upgrade"]');
  }

  get dialogAlert() {
    return $('[data-qa-dialog-content]');
  }

  isMaxClientCount() {
    return this.maxClientDialog.isDisplayed();
  }

  baseLongviewPage() {
    this.title.waitForDisplayed();
    this.addClient.waitForDisplayed();
    $('.MuiPaper-rounded').waitForDisplayed();
    expect(browser.getUrl())
      .withContext(`wrong url path`)
      .toContain('/longview/clients');
    expect(this.title.getText())
      .withContext(`Incorrect page title`)
      .toBe('Longview');
    expect(this.documentationLink.isDisplayed())
      .withContext(`Documentation link ${assertLog.displayed}`)
      .toBe(true);
    expect(this.documentationLink.isEnabled())
      .withContext(`Documentation link ${assertLog.enabled}`)
      .toBe(true);
    expect(this.addClient.isEnabled())
      .withContext(`Add client button ${assertLog.enabled}`)
      .toBe(true);
    expect(this.clientsTab.isEnabled())
      .withContext(`Should be on client tab`)
      .toBe(true);
  }

  addLVClient(clientCount) {
    for (let count = 0; count < clientCount; count++) {
      this.addClient.click();
      $('[data-qa-editable-text="true"]').waitForDisplayed(
        constants.wait.normal
      );
      $('[data-testid="installation"]').waitForDisplayed(constants.wait.normal);
    }
  }

  addLVClientsAPI(token, numClients) {
    let clientList = [];

    for (let count = 0; count < numClients; count++) {
      clientList.push(browser.createLongviewClient(token));
    }
    return clientList;
  }

  deleteLVClientAPI(clientId) {
    return browser.deleteLongviewClient(token, clientId);
  }

  getLVClientsAPI(token) {
    return browser.getLVClients(token);
  }

  removeLVClient(clientId) {
    $(`[data-testid="${clientId}"] [data-qa-action-menu]`).click();
    this.deleteButton.click();
    this.dialogAlert.waitForDisplayed();
    this.lvDelete.click();
    this.dialogAlert.waitForExist(constants.wait.normal, true);
  }

  deleteLVClientsAPI(token, lvClients) {
    lvClients.forEach((id) => {
      browser.deleteLongviewClient(token, id.id);
    });
  }

  removeAllLVClients(token) {
    const clientCount = this.getLVClientsAPI(token);
    this.deleteLVClientsAPI(token, clientCount);
  }

  checkForManaged(token) {
    const userSettings = browser.getGlobalSettings(token);
    return userSettings.managed;
  }
}
export default new LongviewLanding();
