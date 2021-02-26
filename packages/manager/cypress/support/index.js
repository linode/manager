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

// Import commands.js using ES2015 syntax:
import chaiString from 'chai-string';

// chai is a global exposed by Cypress which means
// we can just simply extend it
chai.use(chaiString);

import './commands';
import { deleteAllTestLinodes } from './api/linodes';
import { deleteAllTestNodeBalancers } from './api/nodebalancers';
import { deleteAllTestVolumes } from './api/volumes';
import { deleteAllTestImages } from './api/images';
import { deleteAllTestClients } from './api/longview';
import {
  deleteAllTestAccessKeys,
  deleteAllTestBuckets,
} from './api/objectStorage';
import { deleteAllTestFirewalls } from './api/firewalls';
it('Delete All Test Entities before anything happens', () => {
  deleteAllTestLinodes();
  deleteAllTestNodeBalancers();
  deleteAllTestVolumes();
  deleteAllTestImages();
  deleteAllTestClients();
  deleteAllTestAccessKeys();
  deleteAllTestBuckets();
  deleteAllTestFirewalls();
});
