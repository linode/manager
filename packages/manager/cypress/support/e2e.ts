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

// Cypress command and assertion setup.
import chaiString from 'chai-string';
import '@testing-library/cypress/add-commands';
import 'cypress-axe';
import 'cypress-real-events/support';
import './setup/login-command';
import './setup/defer-command';
chai.use(chaiString);

// Test setup.
import { trackApiRequests } from './setup/request-tracking';
import { mockAccountRequest } from './setup/mock-account-request';

trackApiRequests();
mockAccountRequest();
