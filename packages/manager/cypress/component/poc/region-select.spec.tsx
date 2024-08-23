import * as React from 'react';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { describeComponent } from 'support/util/components';
import { checkComponentA11y } from 'support/util/accessibility';
import { accountAvailabilityFactory, regionFactory } from 'src/factories';
import { ui } from 'support/ui';
import { mockGetAccountAvailability } from 'support/intercepts/account';

describeComponent('RegionSelect', (theme) => {
  beforeEach(() => {
    mockGetAccountAvailability([]);
  });

  describe('interaction', () => {
    describe('open menu', () => {
      it('can open drop-down menu by clicking drop-down arrow', () => {
        const region = regionFactory.build({
          capabilities: ['Object Storage'],
        });
        cy.mountWithTheme(
          <RegionSelect
            regions={[region]}
            currentCapability="Object Storage"
            value={undefined}
            onChange={() => {}}
          />,
          theme
        );

        ui.button
          .findByAttribute('title', 'Open')
          .should('be.visible')
          .should('be.enabled')
          .click();

        ui.autocompletePopper
          .findByTitle(`${region.label} (${region.id})`)
          .should('be.visible');
      });

      it('can open menu by typing into text field', () => {
        const region = regionFactory.build({
          capabilities: ['Object Storage'],
        });
        cy.mountWithTheme(
          <RegionSelect
            regions={[region]}
            currentCapability="Object Storage"
            value={undefined}
            onChange={() => {}}
          />,
          theme
        );

        // Focus text field by clicking "Region" label.
        cy.findByText('Region').should('be.visible').click();

        cy.focused().type(region.label[0]);

        ui.autocompletePopper
          .findByTitle(`${region.label} (${region.id})`)
          .should('be.visible');
      });
    });

    describe('close menu', () => {
      it('can close menu with ESC key', () => {
        const region = regionFactory.build({
          capabilities: ['Object Storage'],
        });
        cy.mountWithTheme(
          <RegionSelect
            regions={[region]}
            currentCapability="Object Storage"
            value={undefined}
            onChange={() => {}}
          />,
          theme
        );

        ui.button
          .findByAttribute('title', 'Open')
          .should('be.visible')
          .should('be.enabled')
          .click();

        ui.autocompletePopper
          .findByTitle(`${region.label} (${region.id})`)
          .should('be.visible');

        cy.get('input').type('{esc}');
        cy.get('[data-qa-autocomplete-popper]').should('not.exist');
      });
    });

    it('can dismiss autocomplete popper by clicking away', () => {
      const region = regionFactory.build({ capabilities: ['Object Storage'] });
      cy.mountWithTheme(
        <>
          <span id="other-element">Other Element</span>
          <RegionSelect
            regions={[region]}
            currentCapability="Object Storage"
            value={undefined}
            onChange={() => {}}
          />
        </>,
        theme
      );

      ui.button
        .findByAttribute('title', 'Open')
        .should('be.visible')
        .should('be.enabled')
        .click();

      ui.autocompletePopper
        .findByTitle(`${region.label} (${region.id})`)
        .should('be.visible');

      cy.get('#other-element').click();
      cy.get('[data-qa-autocomplete-popper]').should('not.exist');
    });

    describe('selection', () => {
      const regionToPreselect = regionFactory.build();
      const regionToSelect = regionFactory.build();
      const otherRegions = regionFactory.buildList(10);

      const regions = [regionToPreselect, regionToSelect, ...otherRegions];

      it('can select a region initially', () => {
        cy.mountWithTheme(
          <RegionSelect
            regions={regions}
            currentCapability={undefined}
            value={undefined}
            onChange={() => {}}
          />,
          theme
        );

        cy.get('input').should('have.attr', 'placeholder', 'Select a Region');

        cy.findByText('Region').should('be.visible').click();

        cy.focused().type(regionToSelect.label[0]);

        ui.autocompletePopper
          .findByTitle(`${regionToSelect.label} (${regionToSelect.id})`)
          .scrollIntoView()
          .should('be.visible')
          .click();

        // Confirm that selection change is reflected by input field value, and that
        // the autocomplete popper has been dismissed.
        cy.get('input').should(
          'have.attr',
          'value',
          `${regionToSelect.label} (${regionToSelect.id})`
        );
        cy.get('[data-qa-autocomplete-popper]').should('not.exist');
      });

      it('can change region selection', () => {
        cy.mountWithTheme(
          <RegionSelect
            regions={regions}
            currentCapability={undefined}
            value={regionToPreselect.id}
            onChange={() => {}}
          />,
          theme
        );

        cy.get('input').should(
          'have.attr',
          'value',
          `${regionToPreselect.label} (${regionToPreselect.id})`
        );

        cy.findByText('Region').should('be.visible').click();

        cy.focused().type(regionToSelect.label[0]);

        ui.autocompletePopper
          .findByTitle(`${regionToSelect.label} (${regionToSelect.id})`)
          .scrollIntoView()
          .should('be.visible')
          .click();

        cy.get('input').should(
          'have.attr',
          'value',
          `${regionToSelect.label} (${regionToSelect.id})`
        );
        cy.get('[data-qa-autocomplete-popper]').should('not.exist');
      });
    });

    describe('logic', () => {
      const regionsWithObj = regionFactory.buildList(5, {
        capabilities: ['Object Storage'],
      });
      const regionsWithoutObj = regionFactory.buildList(5, {
        capabilities: [],
      });
      const regionWithoutAvailability = regionFactory.build({
        capabilities: ['Object Storage'],
      });
      const regions = [
        ...regionsWithObj,
        ...regionsWithoutObj,
        regionWithoutAvailability,
      ];

      it('excludes regions without availability (DC Get Well)', () => {
        const mockAvailability = accountAvailabilityFactory.build({
          region: regionWithoutAvailability.id,
          unavailable: ['Object Storage'],
        });

        mockGetAccountAvailability([mockAvailability]);
        // TODO Remove `dcGetWell` flag override when feature flag is removed from codebase.
        cy.mountWithTheme(
          <RegionSelect
            regions={regions}
            currentCapability="Object Storage"
            value={undefined}
            onChange={() => {}}
          />,
          theme,
          {
            dcGetWell: true,
          }
        );

        ui.button
          .findByAttribute('title', 'Open')
          .should('be.visible')
          .should('be.enabled')
          .click();

        cy.findByText(
          `${regionWithoutAvailability.label} (${regionWithoutAvailability.id})`
        )
          .as('regionItem')
          .scrollIntoView();

        cy.get('@regionItem').should('be.visible');

        cy.findByText(
          `${regionWithoutAvailability.label} (${regionWithoutAvailability.id})`
        )
          .closest('li')
          .should('have.attr', 'data-qa-disabled-item', 'true');
      });

      it('only lists regions with the specified capability', () => {
        cy.mountWithTheme(
          <RegionSelect
            regions={regions}
            currentCapability="Object Storage"
            value={undefined}
            onChange={() => {}}
          />,
          theme
        );

        ui.button
          .findByAttribute('title', 'Open')
          .should('be.visible')
          .should('be.enabled')
          .click();

        regionsWithObj.forEach((region) => {
          ui.autocompletePopper
            .findByTitle(`${region.label} (${region.id})`)
            .scrollIntoView()
            .should('be.visible');
        });
        regionsWithoutObj.forEach((region) => {
          ui.autocompletePopper
            .findByTitle(`${region.label} (${region.id})`)
            .should('not.exist');
        });
      });

      it('lists all regions when no capability is specified', () => {
        cy.mountWithTheme(
          <RegionSelect
            regions={regions}
            currentCapability={undefined}
            value={undefined}
            onChange={() => {}}
          />,
          theme
        );

        ui.button
          .findByAttribute('title', 'Open')
          .should('be.visible')
          .should('be.enabled')
          .click();

        regions.forEach((region) => {
          ui.autocompletePopper
            .findByTitle(`${region.label} (${region.id})`)
            .scrollIntoView()
            .should('be.visible');
        });
      });
    });

    describe('display', () => {
      const selectedRegion = regionFactory.build();
      const regions = [selectedRegion, ...regionFactory.buildList(5)];

      it('passes aXe check when menu is closed without an item selected', () => {
        cy.mountWithTheme(
          <RegionSelect
            regions={regions}
            currentCapability={undefined}
            value={undefined}
            onChange={() => {}}
          />,
          theme
        );
        checkComponentA11y();
      });

      it('passes aXe check when menu is closed with an item selected', () => {
        cy.mountWithTheme(
          <RegionSelect
            regions={regions}
            currentCapability={undefined}
            value={selectedRegion.id}
            onChange={() => {}}
          />,
          theme
        );
        checkComponentA11y();
      });

      it('passes aXe check when menu is open', () => {
        cy.mountWithTheme(
          <RegionSelect
            regions={regions}
            currentCapability={undefined}
            value={selectedRegion.id}
            onChange={() => {}}
          />,
          theme
        );

        ui.button
          .findByAttribute('title', 'Open')
          .should('be.visible')
          .should('be.enabled')
          .click();

        checkComponentA11y();
      });
    });
  });
});
