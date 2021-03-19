import { makeTestLabel } from '../../support/api/common';
import {
  createBucket,
  deleteAllTestAccessKeys,
  deleteBucketByLabel,
} from '../../support/api/objectStorage';
import {
  containsVisible,
  fbtClick,
  fbtVisible,
  getClick,
  getVisible,
} from '../../support/helpers';

describe('access keys', () => {
  it('create access key', () => {
    const bucketLabel = 'cy-test-' + makeTestLabel();
    const accessKeyLabel = 'cy-test-key';
    const clusterId = 'us-east-1';
    // catch create access key request
    cy.intercept('POST', `*/object-storage/keys`).as('createAccessKey');
    createBucket(bucketLabel, clusterId).then(() => {
      cy.visitWithLogin('/object-storage/access-keys');
      getVisible('[data-qa-header]').within(() => {
        fbtVisible('Object Storage');
      });
      fbtClick('Create Access Key');
      containsVisible('Create an Access Key');
      getVisible('[data-testid="textfield-input"]').type(accessKeyLabel);
      getClick('[data-qa-toggle="false"]');
      getVisible('[data-qa-toggle="true"]');
      getClick('[aria-label="Select read/write for all"]');
      fbtClick('Submit');
      cy.wait('@createAccessKey');
      fbtVisible(
        'Your keys have been generated. For security purposes, we can only display your Secret Key once, after which it can’t be recovered.'
      );
      getClick('[data-qa-close-dialog="true"]');
      fbtVisible(accessKeyLabel);
      deleteBucketByLabel(clusterId, bucketLabel);
      deleteAllTestAccessKeys();
    });
  });
});
