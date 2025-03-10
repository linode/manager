import { mockGetAllImages } from 'support/intercepts/images';
import { mockCreateLinode } from 'support/intercepts/linodes';
import {
  interceptGetStackScripts,
  mockGetStackScript,
  mockGetStackScripts,
} from 'support/intercepts/stackscripts';
import { ui } from 'support/ui';
import { getRandomOCAId } from 'support/util/one-click-apps';
import { randomLabel, randomString } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

import { imageFactory, linodeFactory } from 'src/factories';
import { stackScriptFactory } from 'src/factories/stackscripts';
import { getMarketplaceAppLabel } from 'src/features/Linodes/LinodeCreate/Tabs/Marketplace/utilities';
import { oneClickApps } from 'src/features/OneClickApps/oneClickApps';

import type { StackScript } from '@linode/api-v4';

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
      const candidateStackScriptId = getRandomOCAId();
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
          .as('qaInfoFor')
          .first()
          .scrollIntoView();
        cy.get('@qaInfoFor').should('be.visible').should('be.enabled').click();
      });

      ui.drawer
        .findByTitle(getMarketplaceAppLabel(candidateStackScript.label))
        .should('be.visible')
        .within(() => {
          // compare summary instead of description bc latter contains too many special characters and line breaks
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
    const stackscript = stackScriptFactory.build({
      created: '2019-03-08T21:13:32',
      deployments_active: 412,
      deployments_total: 18854,
      description: 'Minecraft OCA',
      id: getRandomOCAId(),
      images: ['linode/debian11', 'linode/ubuntu24.04'],
      is_public: true,
      label: 'E2E Test App',
      logo_url: 'assets/Minecraft.svg',
      mine: false,
      ordinal: 10,
      rev_note: 'remove maxplayers hard coded options [oca-707]',
      script: '#!/usr/bin/env bash\n',
      updated: '2023-09-26T15:00:45',
      user_defined_fields: [
        {
          example: 'lgsmuser',
          label:
            "The username for the Linode's non-root admin/SSH user(must be lowercase)",
          name: 'username',
        },
        {
          example: 'S3cuReP@s$w0rd',
          label: "The password for the Linode's non-root admin/SSH user",
          name: 'password',
        },
        {
          label: 'World Name',
          name: 'levelname',
        },
      ],
      user_gravatar_id: '9d4d301385af69ceb7ad658aad09c142',
      username: 'linode',
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
      .click();
    cy.focused().type(firstName);

    cy.findByLabelText(
      "The password for the Linode's non-root admin/SSH user (required)"
    )
      .should('be.visible')
      .click();
    cy.focused().type(password);

    cy.findByLabelText('World Name (required)').should('be.visible').click();
    cy.focused().type(levelName);

    // Check each field should persist when moving onto another field
    cy.findByLabelText(
      "The username for the Linode's non-root admin/SSH user(must be lowercase) (required)"
    ).should('have.value', firstName);

    cy.findByLabelText(
      "The password for the Linode's non-root admin/SSH user (required)"
    ).should('have.value', password);

    cy.findByLabelText('World Name (required)').should('have.value', levelName);

    // Choose an image
    cy.findByPlaceholderText('Choose an image').click();
    cy.focused().type('{downArrow}{enter}');

    // Choose a region
    ui.regionSelect.find().click();
    cy.focused().type(`${region.id}{enter}`);

    // Choose a Linode plan
    cy.get('[data-qa-plan-row="Dedicated 8 GB"]')
      .closest('tr')
      .within(() => {
        cy.get('[data-qa-radio]').click();
      });

    // Enter a label.
    cy.findByText('Linode Label').should('be.visible').click();
    cy.focused().type(linodeLabel);

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

  // leave test disabled by default
  xit('Validate the summaries of all the OneClick Apps', () => {
    cy.tag('method:e2e');

    interceptGetStackScripts().as('getStackScripts');
    cy.visitWithLogin(`/linodes/create?type=One-Click`);

    cy.wait('@getStackScripts').then((xhr) => {
      // Check the content of the app list
      cy.findByTestId('one-click-apps-container').within(() => {
        const stackScripts: StackScript[] = xhr.response?.body.data ?? [];
        for (const stackscriptId in oneClickApps) {
          // expected data of the app in the selected tile
          const candidateApp = oneClickApps[stackscriptId];
          const candidateStackScript = stackScripts.find(
            (s) => s.id === +stackscriptId
          );

          if (!candidateStackScript) {
            console.log(
              'missing stackscript from UI ',
              stackscriptId,
              candidateApp.description
            );
            throw new Error(
              'No StackScript returned by the API for the candidate app.'
            );
          } else {
            cy.findAllByLabelText(
              `Info for "${getMarketplaceAppLabel(candidateStackScript.label)}"`
            )
              .as('qaInfoFor')
              .first()
              .scrollIntoView();
            cy.get('@qaInfoFor')
              .should('be.visible')
              .should('be.enabled')
              .click();

            ui.drawer.find().within(() => {
              // compare summary instead of description bc latter contains too many special characters and line breaks
              cy.findByText(candidateApp.summary).should('be.visible');
            });

            ui.drawerCloseButton.find().click();
          }
        }
      });
    });
  });
});
