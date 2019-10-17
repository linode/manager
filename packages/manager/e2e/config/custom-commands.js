const {
  deleteAll,
  removeAllLinodes,
  createLinode,
  removeAllVolumes,
  allocatePrivateIp,
  getNodebalancers,
  removeNodebalancer,
  getDomains,
  removeDomain,
  getMyStackScripts,
  removeStackScript,
  getUserProfile,
  updateUserProfile,
  putGlobalSetting,
  getGlobalSettings,
  createVolume,
  getLinodeImage,
  createDomain,
  createNodeBalancer
} = require('../setup/setup');

const {
  loadProxyImposter,
  getImposters,
  deleteImposters,
  loadImposter
} = require('../utils/mb-utils');

const { getToken } = require('../utils/config-utils');
//const { assertLog } = require('../utils/assertionLog');

exports.browserCommands = () => {
  browser.addCommand('loadProxyImposter', function async(proxyConfig) {
    return loadProxyImposter(proxyConfig)
      .then(res => res)
      .catch(error => console.error(error));
  });

  browser.addCommand('getImposters', function async(removeProxies, file) {
    return getImposters(removeProxies, file)
      .then(res => res)
      .catch(error => console.error(error));
  });

  browser.addCommand('loadImposter', function async(imposter) {
    return loadImposter(imposter)
      .then(res => res)
      .catch(error => console.error(error));
  });

  browser.addCommand('deleteImposters', function async() {
    return deleteImposters()
      .then(res => res)
      .catch(error => console.error(error));
  });

  browser.addCommand('readToken', function(username) {
    const token = getToken(username);
    return token;
  });

  browser.addCommand('createLinode', function async(
    token,
    password,
    linodeLabel = false,
    tags = [],
    type,
    region,
    group,
    image,
    privateIP
  ) {
    return createLinode(
      token,
      password,
      linodeLabel,
      tags,
      type,
      region,
      group,
      image,
      privateIP
    )
      .then(res => res)
      .catch(err => err);
  });

  browser.addCommand('removeAllLinodes', function async(token) {
    return removeAllLinodes(token).then(res => res.length > 0);
  });

  browser.addCommand('removeAllVolumes', function async(token) {
    return removeAllVolumes(token).then(res => res);
  });

  browser.addCommand('getDomains', function async(token) {
    return getDomains(token).then(res => res);
  });

  browser.addCommand('removeDomain', function async(token, domainId) {
    return removeDomain(token, domainId).then(res => res);
  });

  browser.addCommand('allocatePrivateIp', function async(token, linodeId) {
    return allocatePrivateIp(token, linodeId).then(res => res);
  });

  browser.addCommand('getNodeBalancers', function async(token) {
    return getNodebalancers(token).then(res => res);
  });

  browser.addCommand('removeNodeBalancer', function async(
    token,
    nodeBalancerId
  ) {
    return removeNodebalancer(token, nodeBalancerId).then(res => res);
  });

  browser.addCommand('getMyStackScripts', function async(token) {
    return getMyStackScripts(token).then(res => res);
  });

  browser.addCommand('removeStackScript', function async(token, id) {
    return removeStackScript(token, id).then(res => res);
  });

  /*
   * Executes a Javascript Click event via the browser console.
   * Useful when an element is not clickable via browser.click()
   * @param { String } elementToClick Selector to execute click event on
   * @returns { undefined } Returns nothing
   */
  browser.addCommand('jsClick', function(elementToClick) {
    browser.execute(function(elementToClick) {
      document.querySelector(elementToClick).click();
    }, elementToClick);
  });

  /* Executes a Javascript click event via the browser console
   *  on all elements matching the given selector name
   * Useful when the element is not clickable via browser.click()
   * @param { String } elementsToClick Selector displayed multiple times to click on
   */
  browser.addCommand('jsClickAll', function(elementsToClick) {
    browser.execute(function(elementsToClick) {
      var els = document.querySelectorAll(elementsToClick);
      els.forEach(e => e.click());
    }, elementsToClick);
  });

  /* Waits for the element to click to be visible
   * then execute a browser.click command on the element
   * @param { String } selector to wait for/click
   * @returns { null } Returns nothing
   */
  browser.addCommand('waitClick', function(elementToClick, timeout = 10000) {
    browser.waitUntil(function() {
      $(elementToClick).waitForDisplayed();
      return $(elementToClick).click().state === 'success';
    }, timeout);
  });

  browser.addCommand('tryClick', function(elementToClick, timeout = 5000) {
    let errorObject;
    browser.waitUntil(
      function() {
        try {
          $(elementToClick).click();
          return true;
        } catch (err) {
          errorObject = err;
          return false;
        }
      },
      timeout,
      `failed to click ${elementToClick} due to ${JSON.stringify(errorObject)}`
    );
  });

  /* Due to issues with react and text fields we now get the length of the
   *  text field value and use the delete key to clear the field. We then
   *  continuously try to set a value on a given selector
   *  for a given timeout. Returns once the value has been successfully set
   * @param { String } selector to target (usually an input)
   * @param { String } value to set input of
   * @param { Number } timeout
   */
  browser.addCommand('trySetValue', function(selector, value, timeout = 10000) {
    fieldLength = $(selector).getValue().length;

    if (fieldLength != 0) {
      console.log(
        `clearing out ${fieldLength} characters for "${selector}" selector`
      );
      $(selector).click();

      for (i = 0; i < fieldLength; i++) {
        $(selector).setValue('\uE003');
      }
    }

    $(selector).setValue(value);
    const newValue = $(selector).getValue();
    console.log(`new set value: ${newValue}, has been entered`);
  });

  /* This is for handling the odd cases of numeric multi select inputs
   * that will not cooperate with wdio e.g. MX preference
   * @param { String } selector to target
   * @param { String } value to enter/change
   */
  browser.addCommand('numberEntry', function(selector, valueToChange) {
    $(selector).click();
    //This is using the shift key and arrow up actions (cmd + a) will not work on
    //non Mac systems, this will work for all systems for single line input
    browser.keys(['\uE008', '\uE013']);
    $(selector).addValue(valueToChange);
  });

  //This has been added as there are react issues with the element.setValue and element.clearValue
  browser.addCommand('setNewValue', function(selector, value) {
    let elValue;

    do {
      $(selector).doubleClick();
      browser.keys('Delete');
      elValue = $(selector).getValue();
    } while (elValue != '');
    $(selector).setValue(value);
  });

  /*this is for selecting all enhanced selects now that they are searchable
   * passes in a selector a the value to search for and then asserts the
   * selection was made
   */
  browser.addCommand('enhancedSelect', (selector, value) => {
    console.log(`setting ${value} for enhanced select`);
    $(selector).click();
    browser.keys(value);
    browser.keys('\uE007');
    console.log(`${value} has been set for "${selector}" enhanced select`);
  });

  /*this is to replace the removed feature to wait for text of an element
   * may not need this but it was easy enough to create
   * @param { string } selector to use
   * @param { Number } timeout value, defaulted to 12 seconds
   */
  browser.addCommand('waitForText', (selector, timeout = 12000) => {
    browser.waitUntil(
      () => {
        console.log(`waiting for "${selector}" text to appear`);
        return $(selector).getText() != null;
      },
      timeout,
      `expected text to appear after ${timeout} milliseconds`
    );
  });

  browser.addCommand('deleteAll', function async(token) {
    return deleteAll(token).then(() => {});
  });

  browser.addCommand('getUserProfile', function async(token) {
    return getUserProfile(token).then(res => res);
  });

  browser.addCommand('updateUserProfile', function async(token, profileData) {
    return updateUserProfile(token, profileData).then(res => res);
  });

  browser.addCommand('updateGlobalSettings', function async(
    token,
    settingsData
  ) {
    return putGlobalSetting(token, settingsData).then(res => res);
  });

  browser.addCommand('getGlobalSettings', function async(token) {
    return getGlobalSettings(token).then(res => res);
  });

  browser.addCommand('createVolume', function async(
    token,
    label,
    region,
    size,
    tags,
    linode_id
  ) {
    return createVolume(token, label, region, size, tags, linode_id).then(
      res => res
    );
  });

  browser.addCommand('getLinodeImage', function async(token, imageId) {
    return getLinodeImage(token, imageId).then(res => res);
  });

  browser.addCommand('createDomain', function async(
    token,
    type,
    domain,
    tags,
    group
  ) {
    return createDomain(token, type, domain, tags, group).then(res => res);
  });

  browser.addCommand('createNodeBalancer', function async(
    token,
    label,
    region,
    tags
  ) {
    return createNodeBalancer(token, label, region, tags).then(res => res);
  });
};
