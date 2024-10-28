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
import { oneClickApps } from 'src/features/OneClickApps/oneClickApps';
import { getMarketplaceAppLabel } from 'src/features/Linodes/LinodeCreate/Tabs/Marketplace/utilities';

import type { StackScript } from '@linode/api-v4';
import { imageFactory, linodeFactory } from 'src/factories';
import { mockGetAllImages } from 'support/intercepts/images';

describe('OneClick Apps (OCA)', () => {
  it('Lists all the OneClick Apps', () => {
    cy.tag('method:e2e');

    interceptGetStackScripts().as('getStackScripts');
    cy.visitWithLogin(`/linodes/create?type=One-Click`);

    cy.wait('@getStackScripts').then((xhr) => {
      const stackScripts: StackScript[] = xhr.response?.body.data ?? [];

      // Check the content of the app list
      cy.findByTestId('one-click-apps-container').within(() => {
        // Check that all sections are present (note: New apps can be empty so not asserting its presence)
        cy.findByText('Popular apps').should('be.visible');
        cy.findByText('All apps').should('be.visible');

        // For every Marketplace app defined in Cloud Manager, make sure the API returns
        // the nessesary StackScript and that the app renders on the page.
        for (const stackscriptId in oneClickApps) {
          const stackscript = stackScripts.find(
            (stackScript) => stackScript.id === +stackscriptId
          );

          if (!stackscript) {
            throw new Error(
              `Cloud Manager's fetch to GET /v4/linode/stackscripts did not receive a StackScript with ID ${stackscriptId}. We expected a StackScript to be in the response.`
            );
          }

          const displayLabel = getMarketplaceAppLabel(stackscript.label);

          // Using `findAllByText` because some apps may be duplicatd under different sections
          cy.findAllByText(displayLabel).should('exist');
        }
      });
    });
  });

  it('Can view app details of a marketplace app', () => {
    cy.tag('method:e2e');

    interceptGetStackScripts().as('getStackScripts');
    cy.visitWithLogin(`/linodes/create?type=One-Click`);

    cy.wait('@getStackScripts').then((xhr) => {
      const stackScripts: StackScript[] = xhr.response?.body.data ?? [];

      // For the sake of this test, use the first marketplace app defined in Cloud Manager
      const candidateStackScriptId = +Object.keys(oneClickApps)[0];

      const candidateApp = oneClickApps[candidateStackScriptId];

      if (!candidateApp) {
        throw new Error(
          'The candidate app for this test no longer exists. The tests needs updating.'
        );
      }

      const candidateStackScript = stackScripts.find(
        (s) => s.id === candidateStackScriptId
      );

      if (!candidateStackScript) {
        throw new Error(
          'No StackScript returned by the API for the candidate app.'
        );
      }

      cy.findByTestId('one-click-apps-container').within(() => {
        cy.findAllByLabelText(
          `Info for "${getMarketplaceAppLabel(candidateStackScript.label)}"`
        )
          .first()
          .scrollIntoView()
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

      ui.drawer
        .findByTitle(getMarketplaceAppLabel(candidateStackScript.label))
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

  it('Deploys a Linode from a One Click App with user defined fields', () => {
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

    // For the sake of this test, use the first marketplace app defined in Cloud Manager
    const candidateStackScriptId = +Object.keys(oneClickApps)[0];

    const stackscript = stackScriptFactory.build({
      id: candidateStackScriptId,
      username: 'linode',
      user_gravatar_id: '9d4d301385af69ceb7ad658aad09c142',
      label: 'E2E Test App',
      description: 'Minecraft OCA',
      ordinal: 10,
      logo_url: 'assets/Minecraft.svg',
      images: ['linode/debian11', 'linode/ubuntu24.04'],
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
      cy.get('[data-qa-selection-card="true"]').should('have.length', 2);
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
