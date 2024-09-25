import { mockGetAccount } from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetAccessKeys } from 'support/intercepts/object-storage';
import { accountFactory, objectStorageKeyFactory } from 'src/factories';
import { ui } from 'support/ui';

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
        { id: 'us-east', s3_endpoint: 'us-east.com', endpoint_type: 'E3' },
      ],
    });

    const mockAccessKey2 = objectStorageKeyFactory.build({
      regions: [
        {
          id: 'us-southeast',
          s3_endpoint: 'us-southeast.com',
          endpoint_type: 'E3',
        },
        { id: 'in-maa', s3_endpoint: 'in-maa.com', endpoint_type: 'E2' },
        { id: 'us-mia', s3_endpoint: 'us-mia.com', endpoint_type: 'E1' },
        { id: 'it-mil', s3_endpoint: 'it-mil.com', endpoint_type: 'E0' },
      ],
    });

    mockGetAccessKeys([mockAccessKey1, mockAccessKey2]).as(
      'getObjectStorageAccessKeys'
    ),
      cy.visitWithLogin('/object-storage/access-keys');

    cy.wait(['@getFeatureFlags', '@getAccount', '@getObjectStorageAccessKeys']);

    // confirm table headers exist
    cy.findByText('Label').should('be.visible');
    cy.findByText('Access Key').should('be.visible');
    cy.findByText('Regions/S3 Hostnames').should('be.visible');
    cy.findByText('Actions').should('be.visible');

    // confirm endpoint types are displayed
    cy.findByText(mockAccessKey1.label).should('be.visible');
    cy.findByText(mockAccessKey2.label).should('be.visible');
    cy.findByText('US, Newark, NJ (E3): us-east.com').should('be.visible');
    cy.findByText('US, Atlanta, GA (E3): us-southeast.com').should(
      'be.visible'
    );

    // confirm endpoint types are present in the drawer
    cy.findByText('and 3 more...').should('be.visible').click();
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
