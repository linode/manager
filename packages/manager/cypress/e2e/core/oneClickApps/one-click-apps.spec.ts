import { containsClick, containsVisible } from 'support/helpers';
import { ui } from 'support/ui';
import { authenticate } from 'support/api/authentication';
import { cleanUp } from 'support/util/cleanup';
import {
  interceptGetStackScripts,
  mockGetStackScripts,
} from 'support/intercepts/stackscripts';
import { interceptCreateLinode } from 'support/intercepts/linodes';
import {
  filterOneClickApps,
  handleAppLabel,
} from 'src/features/Linodes/LinodesCreate/utilities';
import { randomLabel, randomString } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';
import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import { mapStackScriptLabelToOCA } from 'src/features/OneClickApps/utils';
import { baseApps } from 'src/features/StackScripts/stackScriptUtils';
import { stackScriptFactory } from 'src/factories/stackscripts';
import { oneClickApps } from 'src/features/OneClickApps/oneClickApps';

import type { StackScript } from '@linode/api-v4';
import type { OCA } from '@src/features/OneClickApps/types';

authenticate();

describe('OneClick Apps (OCA)', () => {
  before(() => {
    cleanUp(['linodes']);
  });

  it('Lists all the OneClick Apps', () => {
    interceptGetStackScripts().as('getStackScripts');

    cy.visitWithLogin(`/linodes/create?type=One-Click`);

    cy.wait('@getStackScripts').then((xhr) => {
      const stackScripts: StackScript[] = xhr.response?.body.data ?? [];

      const trimmedApps: StackScript[] = filterOneClickApps({
        baseApps,
        newApps: {},
        queryResults: stackScripts,
      });

      // Check the content of the OCA listing
      cy.findByTestId('one-click-apps-container').within(() => {
        // Check that all sections are present (note: New apps can be empty so not asserting its presence)
        cy.findByTestId('Popular apps').should('exist');
        cy.findByTestId('All apps').should('exist');

        trimmedApps.forEach((stackScript) => {
          const { decodedLabel, label } = handleAppLabel(stackScript);

          // Check that every OCA is listed with the correct label
          cy.get(`[data-qa-select-card-heading="${label}"]`).should('exist');

          // Check that every OCA has a drawer match
          // This validates the regex in `mapStackScriptLabelToOCA`
          // and ensures every app listed has a corresponding populated drawer
          // This is only true for the apps defined in `oneClickApps.ts`
          expect(
            mapStackScriptLabelToOCA({
              oneClickApps,
              stackScriptLabel: decodedLabel,
            })
          ).to.not.be.undefined;
        });
      });

      // Check drawer content for one OCA candidate
      const candidate = trimmedApps[0].label;
      const stackScriptCandidate = cy
        .get(`[data-qa-selection-card-info="${candidate}"]`)
        .first();
      stackScriptCandidate.should('exist').click();

      const app: OCA | undefined = mapStackScriptLabelToOCA({
        oneClickApps,
        stackScriptLabel: candidate,
      });

      ui.drawer
        .findByTitle(trimmedApps[0].label)
        .should('be.visible')
        .within(() => {
          containsVisible(app?.description);
          containsVisible(app?.summary);
          containsVisible(app?.website);
        });
      ui.drawerCloseButton.find().click();
      ui.drawer.find().should('not.exist');

      // Check the filtering of the apps
      cy.scrollTo(0, 0);
      const initialNumberOfApps = trimmedApps.length;
      cy.findByPlaceholderText('Search for app name')
        .should('exist')
        .type(candidate);
      cy.findByTestId('one-click-apps-container').within(() => {
        cy.get('[data-qa-selection-card="true"]').should(
          'have.length.below',
          initialNumberOfApps
        );
        cy.get(`[data-qa-selection-card-info="${candidate}"]`).should(
          'be.visible'
        );
      });
    });
  });

  it('Deploys a Linode from a One Click App', () => {
    const stackscriptId = 401709;
    const stackScripts = stackScriptFactory.build({
      id: stackscriptId,
      username: 'linode',
      user_gravatar_id: '9d4d301385af69ceb7ad658aad09c142',
      label: 'E2E Test App',
      description: 'Minecraft OCA',
      ordinal: 10,
      logo_url: 'assets/Minecraft.svg',
      images: ['linode/debian11', 'linode/ubuntu20.04'],
      deployments_total: 18854,
      deployments_active: 412,
      is_public: true,
      mine: false,
      created: '2019-03-08T21:13:32',
      updated: '2023-09-26T15:00:45',
      rev_note: 'remove maxplayers hard coded options [oca-707]',
      script: '#!/usr/bin/env bash\n',
      user_defined_fields: [
        {
          name: 'username',
          label:
            "The username for the Linode's non-root admin/SSH user(must be lowercase)",
          example: 'lgsmuser',
        },
        {
          name: 'password',
          label: "The password for the Linode's non-root admin/SSH user",
          example: 'S3cuReP@s$w0rd',
        },
        {
          name: 'levelname',
          label: 'World Name',
        },
      ],
    });

    const firstName = randomLabel();
    const password = randomString(16);
    const image = 'linode/ubuntu20.04';
    const rootPassword = randomString(16);
    const region = chooseRegion();
    const linodeLabel = randomLabel();
    const levelName = 'Get the enderman!';

    mockGetStackScripts(stackScripts).as('getStackScripts');
    mockAppendFeatureFlags({
      oneClickApps: makeFeatureFlagData({
        401709: 'E2E Test App',
      }),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');

    cy.visitWithLogin(`/linodes/create?type=One-Click`);

    cy.wait('@getFeatureFlags');
    cy.wait('@getStackScripts');

    cy.findByTestId('one-click-apps-container').within(() => {
      // Since it is mock data we can assert the New App section is present
      cy.findByTestId('New apps').should('exist');

      // Check that the app is listed and select it
      cy.get('[data-qa-selection-card="true"]').should('have.length', 3);
      cy.get(`[id=app-${stackscriptId}]`).first().should('be.visible').click();
    });

    // Input the user defined fields
    const userFieldId =
      "the-username-for-the-linode's-non-root-admin/ssh-user(must-be-lowercase)";
    const passwordFieldId =
      "the-password-for-the-linode's-non-root-admin/ssh-user";
    const levelNameFieldId = 'world-name';

    cy.findByTestId('user-defined-fields-panel').within(() => {
      cy.get(`[id="${userFieldId}"]`)
        .should('be.visible')
        .click()
        .type(`${firstName}{enter}`);
      cy.get(`[id="${passwordFieldId}"]`)
        .should('be.visible')
        .click()
        .type(`${password}{enter}`);
      cy.get(`[id="${levelNameFieldId}"]`)
        .should('be.visible')
        .click()
        .type(`${levelName}{enter}`);

      // Check each field should persist when moving onto another field
      cy.get(`[id="${userFieldId}"]`).should('have.value', firstName);
      cy.get(`[id="${passwordFieldId}"]`).should('have.value', password);
      cy.get(`[id="${levelNameFieldId}"]`).should('have.value', levelName);
    });

    // Choose an image
    cy.get('[data-qa-enhanced-select="Choose an image"]').within(() => {
      containsClick('Choose an image').type(`${image}{enter}`);
    });

    // Choose a region
    cy.get(`[data-qa-enhanced-select="Select a Region"]`).within(() => {
      containsClick('Select a Region').type(`${region.id}{enter}`);
    });

    // Choose a Linode plan
    cy.get('[data-qa-plan-row="Dedicated 8 GB"]')
      .closest('tr')
      .within(() => {
        cy.get('[data-qa-radio]').click();
      });

    // Enter a label.
    cy.findByText('Linode Label')
      .should('be.visible')
      .click()
      .type('{selectAll}{backspace}')
      .type(linodeLabel);

    // Choose a Root Password
    cy.get('[id="root-password"]').type(rootPassword);

    // Create the Linode
    interceptCreateLinode().as('createLinode');
    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.wait('@createLinode');
    ui.toast.assertMessage(`Your Linode ${linodeLabel} is being created.`);
  });
});
