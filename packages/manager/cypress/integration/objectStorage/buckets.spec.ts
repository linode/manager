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
    cy.intercept('*/object-storage/buckets*', (req) => {
      req.reply(mockBucket);
    }).as('mockBucket');
    cy.intercept('GET', `*/object-storage/buckets/${bucketCluster}*`, (req) => {
      req.reply(mockBucket);
    }).as('getBuckets');

    cy.visitWithLogin('/object-storage/buckets');
    fbtClick('Create Bucket');
    getClick('[data-qa-cluster-label="true"]').type(bucketLabel);
    getClick('[data-qa-enhanced-select="Select a Region"]');
    fbtClick(regionSelect);
    getVisible('[data-qa-submit="true"]').within(() => {
      fbtClick('Create Bucket');
    });
    cy.wait('@mockBucket');
    cy.wait('@getBuckets');
    fbtVisible(bucketLabel);
    fbtVisible(hostname);
    fbtVisible(regionSelect);
  });
});
