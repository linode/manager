// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import '@testing-library/cypress/add-commands';
// Cypress command and assertion setup.
import chaiString from 'chai-string';
import 'cypress-axe';
import 'cypress-real-events/support';

import './setup/defer-command';
import './setup/login-command';
import './setup/page-visit-tracking-commands';
chai.use(chaiString);

chai.use(function (chai, utils) {
  utils.overwriteProperty(chai.Assertion.prototype, 'disabled', function () {
    return function (this: Chai.AssertionStatic) {
      const obj = utils.flag(this, 'object');
      const isDisabled = Cypress.$(obj).is(':disabled');
      const isAriaDisabled = Cypress.$(obj).attr('aria-disabled') === 'true';

      this.assert(
        isDisabled || isAriaDisabled,
        'expected #{this} to be disabled',
        'expected #{this} not to be disabled',
        undefined
      );
    };
  });

  utils.overwriteProperty(chai.Assertion.prototype, 'enabled', function () {
    return function (this: Chai.AssertionStatic) {
      const obj = utils.flag(this, 'object');
      const isDisabled = Cypress.$(obj).is(':disabled');
      const isAriaDisabled = Cypress.$(obj).attr('aria-disabled') === 'true';

      this.assert(
        !isDisabled && !isAriaDisabled,
        'expected #{this} to be enabled',
        'expected #{this} not to be enabled',
        undefined
      );
    };
  });
});

// Test setup.
import { mockAccountRequest } from './setup/mock-account-request';
import { trackApiRequests } from './setup/request-tracking';

trackApiRequests();
mockAccountRequest();
