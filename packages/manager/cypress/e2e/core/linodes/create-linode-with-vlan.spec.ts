import { regionFactory } from 'src/factories';
import { mockGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui';
import { linodeCreatePage } from 'support/ui/pages';
import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { makeFeatureFlagData } from 'support/util/feature-flags';

describe('Create Linode with VLANs', () => {
  // TODO Remove feature flag mocks when `linodeCreateRefactor` flag is retired.
  beforeEach(() => {
    mockAppendFeatureFlags({
      linodeCreateRefactor: makeFeatureFlagData(true),
    });
    mockGetFeatureFlagClientstream();
  });

  it.skip('can assign existing VLANs during Linode create flow', () => {});

  it.skip('can assign new VLANs during Linode create flow', () => {});

  /*
   * - Uses mock API data to confirm that VLANs cannot be assigned to Linodes in regions without capability.
   * - Confirms that VLAN fields are disabled before and after selecting a region.
   */
  it('cannot assign VLANs in regions without capability', () => {
    const availabilityNotice =
      'VLANs are currently available in select regions.';

    const nonVlanRegion = regionFactory.build({
      capabilities: ['Linodes'],
    });

    const vlanRegion = regionFactory.build({
      capabilities: ['Linodes', 'Vlans'],
    });

    mockGetRegions([nonVlanRegion, vlanRegion]);
    cy.visitWithLogin('/linodes/create');

    // Expand VLAN accordion, confirm VLAN availability notice is displayed and
    // that VLAN fields are disabled while no region is selected.
    ui.accordionHeading.findByTitle('VLAN').click();
    ui.accordion
      .findByTitle('VLAN')
      .scrollIntoView()
      .within(() => {
        cy.contains(availabilityNotice).should('be.visible');
        cy.findByLabelText('VLAN').should('be.disabled');
        cy.findByLabelText(/IPAM Address/).should('be.disabled');
      });

    // Select a region that is known not to have VLAN capability.
    linodeCreatePage.selectRegionById(nonVlanRegion.id);

    // Confirm that VLAN fields are still disabled.
    ui.accordion
      .findByTitle('VLAN')
      .scrollIntoView()
      .within(() => {
        cy.findByLabelText('VLAN').should('be.disabled');
        cy.findByLabelText(/IPAM Address/).should('be.disabled');
      });
  });
});
