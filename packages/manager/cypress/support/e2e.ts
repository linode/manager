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

import chaiString from 'chai-string';
import 'cypress-real-events/support';

// chai is a global exposed by Cypress which means
// we can just simply extend it
chai.use(chaiString);

import './commands';
import './request-tracking';
