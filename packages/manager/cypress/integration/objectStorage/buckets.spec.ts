import { BETA_API_ROOT } from '@src/constants';
import { createMockBucket } from 'cypress/support/api/objectStorage';
import {
  fbtClick,
  fbtVisible,
  getClick,
  getVisible,
} from 'cypress/support/helpers';

const bucketLabel = createMockBucket().data[0].label;
const bucketCluster = createMockBucket().data[0].cluster;
const hostname = `${bucketLabel}.${bucketCluster}.linodeobjets.com`;
const mockBucket = createMockBucket({ hostname });
const regionSelect = 'Frankfurt, DE';

describe('create bucket flow, mocked data', () => {
  it('creates bucket', () => {
    cy.intercept('POST', '*/object-storage/buckets*', (req) => {
      req.reply(mockBucket);
    }).as('mockBucket');
    cy.intercept('GET', '*/account/agreements', (req) => {
      req.reply({ privacy_policy: true, eu_model: true });
    }).as('mockEuAccept');

    cy.visitWithLogin('/object-storage/buckets');
    fbtClick('Create Bucket');
    cy.wait('@mockEuAccept');
    getClick('[data-qa-cluster-label="true"]').type(bucketLabel);
    getClick('[data-qa-enhanced-select="Select a Region"]');
    getClick('[data-qa-region-select-item="eu-central-1"]');
    getVisible('[data-qa-submit="true"]').within(() => {
      fbtClick('Create Bucket');
    });
    cy.wait('@mockBucket');
    cy.intercept('GET', `*/object-storage/buckets/${bucketCluster}*`, (req) => {
      req.reply(mockBucket);
    }).as('getBuckets');
    cy.reload();
    cy.wait('@getBuckets');
    cy.get('[data-qa-bucket-cell="cy-test-bucket"]').within(() => {
      fbtVisible(bucketLabel);
      fbtVisible(hostname);
      fbtVisible(regionSelect);
    });
  });
});
