import { accountAvailabilityFactory, regionFactory } from '@linode/utilities';
import * as React from 'react';
import { ui } from 'support/ui';
import { checkComponentA11y } from 'support/util/accessibility';
import { componentTests, visualTests } from 'support/util/components';
import { createSpy } from 'support/util/components';

import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';

componentTests('RegionSelect', (mount) => {
  describe('Interactions', () => {
    describe('Open menu', () => {
      /*
       * - Region selection drop-down can be opened by clicking arrow button.
       */
      it('can open drop-down menu by clicking drop-down arrow', () => {
        const region = regionFactory.build({
          capabilities: ['Object Storage'],
        });

        mount(
          <RegionSelect
            accountAvailabilityData={[]}
            accountAvailabilityLoading={false}
            currentCapability="Object Storage"
            flags={{}}
            onChange={() => {}}
            regions={[region]}
            value={undefined}
          />
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

      /*
       * - Region selection drop-down can be opened by typing into text field.
       */
      it('can open menu by typing into text field', () => {
        const region = regionFactory.build({
          capabilities: ['Object Storage'],
        });

        mount(
          <RegionSelect
            accountAvailabilityData={[]}
            accountAvailabilityLoading={false}
            currentCapability="Object Storage"
            flags={{}}
            onChange={() => {}}
            regions={[region]}
            value={undefined}
          />
        );

        // Focus text field by clicking "Region" label.
        cy.findByText('Region').should('be.visible').click();

        cy.focused().type(region.label[0]);

        ui.autocompletePopper
          .findByTitle(`${region.label} (${region.id})`)
          .should('be.visible');
      });
    });

    describe('Close menu', () => {
      /*
       * - Region selection drop-down can be dismissed by pressing the ESC key.
       */
      it('can close menu with ESC key', () => {
        const region = regionFactory.build({
          capabilities: ['Object Storage'],
        });

        mount(
          <RegionSelect
            accountAvailabilityData={[]}
            accountAvailabilityLoading={false}
            currentCapability="Object Storage"
            flags={{}}
            onChange={() => {}}
            regions={[region]}
            value={undefined}
          />
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

      it('can close autocomplete popper by clicking away', () => {
        const region = regionFactory.build({
          capabilities: ['Object Storage'],
        });
        mount(
          <>
            <span id="other-element">Other Element</span>
            <RegionSelect
              accountAvailabilityData={[]}
              accountAvailabilityLoading={false}
              currentCapability="Object Storage"
              flags={{}}
              onChange={() => {}}
              regions={[region]}
              value={undefined}
            />
          </>
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
    });

    describe('Selection', () => {
      const regionToPreselect = regionFactory.build();
      const regionToSelect = regionFactory.build();
      const otherRegions = regionFactory.buildList(10);

      const regions = [regionToPreselect, regionToSelect, ...otherRegions];

      it('can select a region initially', () => {
        mount(
          <RegionSelect
            accountAvailabilityData={[]}
            accountAvailabilityLoading={false}
            currentCapability={undefined}
            flags={{}}
            onChange={() => {}}
            regions={regions}
            value={undefined}
          />
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

      /*
       * - User can can selection after having already selected a region.
       */
      it('can change region selection', () => {
        mount(
          <RegionSelect
            accountAvailabilityData={[]}
            accountAvailabilityLoading={false}
            currentCapability={undefined}
            flags={{}}
            onChange={() => {}}
            regions={regions}
            value={regionToPreselect.id}
          />
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

      it('can clear region selection', () => {
        mount(
          <RegionSelect
            accountAvailabilityData={[]}
            accountAvailabilityLoading={false}
            currentCapability={undefined}
            flags={{}}
            onChange={() => {}}
            regions={regions}
            value={regionToSelect.id}
          />
        );

        cy.get('input').should(
          'have.attr',
          'value',
          `${regionToSelect.label} (${regionToSelect.id})`
        );

        cy.findByLabelText('Clear')
          .should('be.visible')
          .should('be.enabled')
          .click();

        cy.get('input').should('have.attr', 'value', '');

        cy.get('input').should('have.attr', 'placeholder', 'Select a Region');
      });

      it('cannot clear region selection when clearable is disabled', () => {
        mount(
          <RegionSelect
            accountAvailabilityData={[]}
            accountAvailabilityLoading={false}
            currentCapability={undefined}
            disableClearable={true}
            flags={{}}
            onChange={() => {}}
            regions={regions}
            value={regionToSelect.id}
          />
        );

        cy.get('input').should(
          'have.attr',
          'value',
          `${regionToSelect.label} (${regionToSelect.id})`
        );

        cy.findByLabelText('Clear').should('not.exist');
      });

      it('cannot clear region selection when no region is selected', () => {
        mount(
          <RegionSelect
            accountAvailabilityData={[]}
            accountAvailabilityLoading={false}
            currentCapability={undefined}
            flags={{}}
            onChange={() => {}}
            regions={regions}
            value={undefined}
          />
        );

        cy.get('input').should('have.attr', 'value', '');

        cy.get('input').should('have.attr', 'placeholder', 'Select a Region');
        cy.findByLabelText('Clear').should('not.exist');
      });

      it('calls `onChange` callback when region is initially selected', () => {
        const spyFn = createSpy(() => {}, 'changeSpy');
        mount(
          <RegionSelect
            accountAvailabilityData={[]}
            accountAvailabilityLoading={false}
            currentCapability={undefined}
            flags={{}}
            onChange={spyFn}
            regions={regions}
            value={undefined}
          />
        );

        cy.findByText('Region').should('be.visible').click();

        cy.focused().type(regionToSelect.label[0]);

        ui.autocompletePopper
          .findByTitle(`${regionToSelect.label} (${regionToSelect.id})`)
          .scrollIntoView()
          .should('be.visible')
          .click();

        cy.get('@changeSpy').should('have.been.calledOnce');
      });

      it('calls `onChange` callback when region is cleared', () => {
        const spyFn = createSpy(() => {}, 'changeSpy');
        mount(
          <RegionSelect
            accountAvailabilityData={[]}
            accountAvailabilityLoading={false}
            currentCapability={undefined}
            flags={{}}
            onChange={spyFn}
            regions={regions}
            value={regionToSelect.id}
          />
        );

        cy.findByLabelText('Clear')
          .should('be.visible')
          .should('be.enabled')
          .click();

        cy.get('@changeSpy').should('have.been.calledOnce');
      });
    });
  });

  describe('Logic', () => {
    // TODO Gecko tests.
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

      // TODO Remove `dcGetWell` flag override when feature flag is removed from codebase.
      mount(
        <RegionSelect
          accountAvailabilityData={[mockAvailability]}
          accountAvailabilityLoading={false}
          currentCapability="Object Storage"
          flags={{}}
          onChange={() => {}}
          regions={regions}
          value={undefined}
        />,
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
      mount(
        <RegionSelect
          accountAvailabilityData={[]}
          accountAvailabilityLoading={false}
          currentCapability="Object Storage"
          flags={{}}
          onChange={() => {}}
          regions={regions}
          value={undefined}
        />
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
        ui.autocompletePopper.find().within(() => {
          cy.findByText(`${region.label} (${region.id})`).should('not.exist');
        });
      });
    });

    it('lists all regions when no capability is specified', () => {
      mount(
        <RegionSelect
          accountAvailabilityData={[]}
          accountAvailabilityLoading={false}
          currentCapability={undefined}
          flags={{}}
          onChange={() => {}}
          regions={regions}
          value={undefined}
        />
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

  visualTests((mount) => {
    describe('Accessibility checks', () => {
      const selectedRegion = regionFactory.build();
      const regions = [selectedRegion, ...regionFactory.buildList(5)];

      it('passes aXe check when menu is closed without an item selected', () => {
        mount(
          <RegionSelect
            accountAvailabilityData={[]}
            accountAvailabilityLoading={false}
            currentCapability={undefined}
            flags={{}}
            onChange={() => {}}
            regions={regions}
            value={undefined}
          />
        );
        checkComponentA11y();
      });

      it('passes aXe check when menu is closed with an item selected', () => {
        mount(
          <RegionSelect
            accountAvailabilityData={[]}
            accountAvailabilityLoading={false}
            currentCapability={undefined}
            flags={{}}
            onChange={() => {}}
            regions={regions}
            value={selectedRegion.id}
          />
        );
        checkComponentA11y();
      });

      it('passes aXe check when menu is open', () => {
        mount(
          <RegionSelect
            accountAvailabilityData={[]}
            accountAvailabilityLoading={false}
            currentCapability={undefined}
            flags={{}}
            onChange={() => {}}
            regions={regions}
            value={selectedRegion.id}
          />
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
