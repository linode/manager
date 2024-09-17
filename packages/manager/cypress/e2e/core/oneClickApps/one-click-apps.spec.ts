import { ui } from 'support/ui';
import {
  interceptGetStackScripts,
  mockGetStackScript,
  mockGetStackScripts,
} from 'support/intercepts/stackscripts';
import { mockCreateLinode } from 'support/intercepts/linodes';
import { randomLabel, randomString } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';
import { stackScriptFactory } from 'src/factories/stackscripts';
import { oneClickApps } from 'src/features/OneClickApps/oneClickAppsv2';
import { getMarketplaceAppLabel } from 'src/features/Linodes/LinodeCreatev2/Tabs/Marketplace/utilities';

import type { StackScript } from '@linode/api-v4';
import { imageFactory, linodeFactory } from 'src/factories';
import { mockGetAllImages } from 'support/intercepts/images';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';

describe('OneClick Apps (OCA)', () => {
  it('Lists all the OneClick Apps', () => {
    cy.tag('method:e2e');

    // Mock no overrides to prevent feature flag changes from causing test interfearence
    mockAppendFeatureFlags({
      marketplaceAppOverrides: [],
    });

    interceptGetStackScripts().as('getStackScripts');
    cy.visitWithLogin(`/linodes/create?type=One-Click`);

    cy.wait('@getStackScripts').then((xhr) => {
      const stackScripts: StackScript[] = xhr.response?.body.data ?? [];

      // Check the content of the app list
      cy.findByTestId('one-click-apps-container').within(() => {
        // Check that all sections are present (note: New apps can be empty so not asserting its presence)
        cy.findByText('Popular apps').should('be.visible');
        cy.findByText('All apps').should('be.visible');

        for (const stackscriptId in oneClickApps) {
          const stackscript = stackScripts.find(s => s.id === +stackscriptId);
          const app = oneClickApps[stackscriptId];
          if (!stackscript) {
            throw new Error(`Cloud Manager's fetch to GET /v4/linode/stackscripts did not recieve a StackScript with ID ${stackscriptId}. We expected that StackScript to be in the response for the Marketplace app named "${app.name}".`);
          }

          // Use `findAllByText` because some apps may be duplicatd under different sections
          cy.findAllByText(getMarketplaceAppLabel(app.name)).should('exist');
        }
      });
    });
  });

  it('Can view app details of a marketplace app', () => {
    cy.tag('method:e2e');

    // Mock no overrides to prevent feature flag changes from causing test interfearence
    mockAppendFeatureFlags({
      marketplaceAppOverrides: [],
    });

    interceptGetStackScripts().as('getStackScripts');
    cy.visitWithLogin(`/linodes/create?type=One-Click`);

    cy.wait('@getStackScripts').then((xhr) => {
      const stackScripts: StackScript[] = xhr.response?.body.data ?? [];

      const candidateStackScriptId = +(Object.keys(oneClickApps)[0]);

      const candidateApp = oneClickApps[candidateStackScriptId];

      if (!candidateApp) {
        throw new Error("The candidate app for this test no longer exists. The tests needs updating.");
      }

      const candidateStackScript = stackScripts.find(s => s.id === candidateStackScriptId);

      if (!candidateStackScript) {
        throw new Error("No StackScript returned by the API for the candidate app.");
      }

      cy.findByTestId('one-click-apps-container').within(() => {
        cy.findAllByLabelText(`Info for "${candidateApp.name}"`)
          .first()
          .scrollIntoView()
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

      ui.drawer
        .findByTitle(candidateApp.name)
        .should('be.visible')
        .within(() => {
          cy.findByText(candidateApp.description).should('be.visible');
          cy.findByText(candidateApp.summary).should('be.visible');
          cy.findByText(candidateApp.website!).should('be.visible');
        });

      ui.drawerCloseButton.find().click();
      ui.drawer.find().should('not.exist');
    });
  });

  it('Deploys a Linode from a One Click App', () => {
    const images = [
      imageFactory.build({
        id: 'linode/ubuntu22.04',
        label: 'Ubuntu 20.04',
      }),
      imageFactory.build({
        id: 'linode/debian11',
        label: 'Debian 11',
      }),
    ];

    const stackscript = stackScriptFactory.build({
      id: 0,
      username: 'linode',
      user_gravatar_id: '9d4d301385af69ceb7ad658aad09c142',
      label: 'E2E Test App',
      description: 'Minecraft OCA',
      ordinal: 10,
      logo_url: 'assets/Minecraft.svg',
      images: ['linode/debian11', 'linode/ubuntu22.04'],
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

    const rootPassword = randomString(16);
    const region = chooseRegion();
    const linodeLabel = randomLabel();

    // UDF values
    const firstName = randomLabel();
    const password = randomString(16);
    const levelName = 'Get the enderman!';

    const linode = linodeFactory.build({
      label: linodeLabel,
    });

    mockGetAllImages(images);
    mockGetStackScripts([stackscript]).as('getStackScripts');
    mockGetStackScript(stackscript.id, stackscript);

    cy.visitWithLogin(`/linodes/create?type=One-Click`);

    cy.wait('@getStackScripts');

    cy.findByTestId('one-click-apps-container').within(() => {
      // Since it is mock data we can assert the New App section is present
      cy.findByText('New apps').should('be.visible');

      // Check that the app is listed and select it
      cy.get('[data-qa-selection-card="true"]').should('have.length', 3);
      cy.findAllByText(stackscript.label).first().should('be.visible').click();
    });

    cy.findByLabelText(
      "The username for the Linode's non-root admin/SSH user(must be lowercase) (required)"
    )
      .should('be.visible')
      .click()
      .type(firstName);

    cy.findByLabelText(
      "The password for the Linode's non-root admin/SSH user (required)"
    )
      .should('be.visible')
      .click()
      .type(password);

    cy.findByLabelText('World Name (required)')
      .should('be.visible')
      .click()
      .type(levelName);

    // Check each field should persist when moving onto another field
    cy.findByLabelText(
      "The username for the Linode's non-root admin/SSH user(must be lowercase) (required)"
    ).should('have.value', firstName);

    cy.findByLabelText(
      "The password for the Linode's non-root admin/SSH user (required)"
    ).should('have.value', password);

    cy.findByLabelText('World Name (required)').should('have.value', levelName);

    // Choose an image
    cy.findByPlaceholderText('Choose an image')
      .click()
      .type('{downArrow}{enter}');

    // Choose a region
    ui.regionSelect.find().click().type(`${region.id}{enter}`);

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
      .type(linodeLabel);

    // Choose a Root Password
    cy.get('[id="root-password"]').type(rootPassword);

    // Create the Linode
    mockCreateLinode(linode).as('createLinode');

    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.wait('@createLinode');

    ui.toast.assertMessage(`Your Linode ${linode.label} is being created.`);
  });
});
