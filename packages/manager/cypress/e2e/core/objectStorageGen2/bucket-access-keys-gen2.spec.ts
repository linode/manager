import {
  grantsFactory,
  profileFactory,
  regionFactory,
} from '@linode/utilities';
import { mockGetAccount } from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  mockGetAccessKeys,
  mockGetObjectStorageEndpoints,
} from 'support/intercepts/object-storage';
import {
  mockGetProfile,
  mockGetProfileGrants,
} from 'support/intercepts/profile';
import { mockGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui';

import {
  accountFactory,
  objectStorageEndpointsFactory,
  objectStorageKeyFactory,
} from 'src/factories';

describe('Object Storage gen2 access keys tests', () => {
  /**
   * - Confirms endpoint types are displayed in the "Regions/S3 Hostnames" column
   * - Confirms endpoint types are present in the list of hostnames of the "Regions / S3 Hostnames" drawer
   */
  it('Confirms the changes to the Access Keys page for Object Storage gen2', () => {
    const mockRegions = [
      regionFactory.build({
        capabilities: ['Object Storage'],
        country: 'us',
        id: 'us-east',
        label: 'Newark, NJ',
      }),
      regionFactory.build({
        capabilities: ['Object Storage'],
        country: 'us',
        id: 'us-southeast',
        label: 'Atlanta, GA',
      }),
      regionFactory.build({
        capabilities: ['Object Storage'],
        country: 'in',
        id: 'in-maa',
        label: 'Chennai',
      }),
      regionFactory.build({
        capabilities: ['Object Storage'],
        country: 'us',
        id: 'us-mia',
        label: 'Miami, FL',
      }),
      regionFactory.build({
        capabilities: ['Object Storage'],
        country: 'it',
        id: 'it-mil',
        label: 'Milan',
      }),
    ];
    const mockEndpoints = [
      objectStorageEndpointsFactory.build({
        endpoint_type: 'E0',
        region: mockRegions[4].id,
        s3_endpoint: null,
      }),
      objectStorageEndpointsFactory.build({
        endpoint_type: 'E1',
        region: mockRegions[3].id,
        s3_endpoint: null,
      }),
      objectStorageEndpointsFactory.build({
        endpoint_type: 'E2',
        region: mockRegions[2].id,
        s3_endpoint: null,
      }),
      objectStorageEndpointsFactory.build({
        endpoint_type: 'E3',
        region: mockRegions[0].id,
        s3_endpoint: null,
      }),
      objectStorageEndpointsFactory.build({
        endpoint_type: 'E3',
        region: mockRegions[1].id,
        s3_endpoint: null,
      }),
    ];
    mockGetObjectStorageEndpoints(mockEndpoints).as(
      'getObjectStorageEndpoints'
    );
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
    mockGetRegions(mockRegions).as('getRegions');
    const mockAccessKey1 = objectStorageKeyFactory.build({
      regions: [
        {
          endpoint_type: 'E3',
          id: mockRegions[0].id,
          s3_endpoint: `${mockRegions[0].id}.com`,
        },
      ],
    });

    const mockAccessKey2 = objectStorageKeyFactory.build({
      regions: [
        {
          endpoint_type: 'E3',
          id: mockRegions[1].id,
          s3_endpoint: `${mockRegions[1].id}.com`,
        },
        {
          endpoint_type: 'E2',
          id: mockRegions[2].id,
          s3_endpoint: `${mockRegions[2].id}.com`,
        },
        {
          endpoint_type: 'E1',
          id: mockRegions[3].id,
          s3_endpoint: `${mockRegions[3].id}.com`,
        },
        {
          endpoint_type: 'E0',
          id: mockRegions[4].id,
          s3_endpoint: `${mockRegions[4].id}.com`,
        },
      ],
    });

    mockGetAccessKeys([mockAccessKey1, mockAccessKey2]).as(
      'getObjectStorageAccessKeys'
    );
    cy.visitWithLogin('/object-storage/access-keys');

    cy.wait([
      '@getRegions',
      '@getObjectStorageEndpoints',
      '@getFeatureFlags',
      '@getAccount',
      '@getObjectStorageAccessKeys',
    ]);

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
    mockGetProfileGrants(grantsFactory.build());
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
