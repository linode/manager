import { profileFactory } from '@linode/utilities';
import { mockGetAccount } from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetAccessKeys } from 'support/intercepts/object-storage';
import { mockGetProfile } from 'support/intercepts/profile';
import { ui } from 'support/ui';

import { accountFactory, objectStorageKeyFactory } from 'src/factories';

describe('Object Storage gen2 access keys tests', () => {
  /**
   * - Confirms endpoint types are displayed in the "Regions/S3 Hostnames" column
   * - Confirms endpoint types are present in the list of hostnames of the "Regions / S3 Hostnames" drawer
   */
  it('Confirms the changes to the Access Keys page for Object Storage gen2', () => {
    mockAppendFeatureFlags({
      objMultiCluster: true,
      objectStorageGen2: { enabled: true },
    }).as('getFeatureFlags');
    mockGetAccount(
      accountFactory.build({
        capabilities: [
          'Object Storage',
          'Object Storage Endpoint Types',
          'Object Storage Access Key Regions',
        ],
      })
    ).as('getAccount');

    const mockAccessKey1 = objectStorageKeyFactory.build({
      regions: [
        { endpoint_type: 'E3', id: 'us-east', s3_endpoint: 'us-east.com' },
      ],
    });

    const mockAccessKey2 = objectStorageKeyFactory.build({
      regions: [
        {
          endpoint_type: 'E3',
          id: 'us-southeast',
          s3_endpoint: 'us-southeast.com',
        },
        { endpoint_type: 'E2', id: 'in-maa', s3_endpoint: 'in-maa.com' },
        { endpoint_type: 'E1', id: 'us-mia', s3_endpoint: 'us-mia.com' },
        { endpoint_type: 'E0', id: 'it-mil', s3_endpoint: 'it-mil.com' },
      ],
    });

    mockGetAccessKeys([mockAccessKey1, mockAccessKey2]).as(
      'getObjectStorageAccessKeys'
    );
    cy.visitWithLogin('/object-storage/access-keys');

    cy.wait(['@getFeatureFlags', '@getAccount', '@getObjectStorageAccessKeys']);

    // confirm table headers exist
    cy.findByText('Label').should('be.visible');
    cy.findByText('Access Key').should('be.visible');
    cy.findByText('Regions/S3 Hostnames').should('be.visible');

    // confirm endpoint types are displayed
    cy.findByText(mockAccessKey1.label).should('be.visible');
    cy.findByText(mockAccessKey2.label).should('be.visible');
    cy.findByText('US, Newark, NJ (E3): us-east.com').should('be.visible');

    // Using contains since the text includes additional information, i.e. '| +2 regions | Show All'
    cy.contains('US, Atlanta, GA (E3): us-southeast.com').should('be.visible');
    cy.contains('+ 3 regions').should('be.visible');
    cy.findByText('Show All').should('be.visible').click();

    ui.drawer
      .findByTitle('Regions / S3 Hostnames')
      .should('be.visible')
      .within(() => {
        cy.findByText('S3 Endpoint Hostnames').should('be.visible');
        cy.get('input[value="US, Atlanta, GA (E3): us-southeast.com"]').should(
          'be.visible'
        );
        cy.get('input[value="IN, Chennai (E2): in-maa.com"]').should(
          'be.visible'
        );
        cy.get('input[value="US, Miami, FL (E1): us-mia.com"]').should(
          'be.visible'
        );
        cy.get('input[value="IT, Milan (E0): it-mil.com"]').should(
          'be.visible'
        );
      });
  });
});

/**
 * When a restricted user navigates to object-storage/access-keys/create, an error is shown in the "Create Access Key" drawer noting that the user does not have access key creation permissions
 */
describe('Object Storage Gen2 create access key modal has disabled fields for restricted user', () => {
  beforeEach(() => {
    mockAppendFeatureFlags({
      objMultiCluster: true,
      objectStorageGen2: { enabled: true },
    }).as('getFeatureFlags');
    mockGetAccount(
      accountFactory.build({
        capabilities: [
          'Object Storage',
          'Object Storage Endpoint Types',
          'Object Storage Access Key Regions',
        ],
      })
    ).as('getAccount');
    // restricted user
    mockGetProfile(
      profileFactory.build({
        email: 'mock-user@linode.com',
        restricted: true,
      })
    ).as('getProfile');
  });

  // access keys creation
  it('create access keys form', () => {
    cy.visitWithLogin('/object-storage/access-keys/create');

    cy.wait(['@getFeatureFlags', '@getAccount', '@getProfile']);
    // error message
    ui.drawer
      .findByTitle('Create Access Key')
      .should('be.visible')
      .within(() => {
        cy.findByText(
          /You don't have permissions to create an Access Key./
        ).should('be.visible');
        // label
        cy.findByLabelText(/Label.*/)
          .should('be.visible')
          .should('be.disabled');
        // region
        ui.regionSelect.find().should('be.visible').should('be.disabled');
        // submit button is disabled
        cy.findByTestId('submit').should('be.visible').should('be.disabled');
      });
  });
});
