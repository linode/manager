import { createLinode } from 'support/api/linodes';
import { containsClick, getClick } from 'support/helpers';
import { apiMatcher } from 'support/util/intercepts';
import { ui } from 'support/ui';
import { randomString, randomLabel } from 'support/util/random';
import { authenticate } from 'support/api/authentication';
import { createStackScript } from '@linode/api-v4/lib';
import { interceptGetStackScripts } from 'support/intercepts/stackscripts';
import { createLinodeRequestFactory } from '@src/factories';
import { cleanUp } from 'support/util/cleanup';

const createStackScriptAndLinode = async (
  stackScriptRequestPayload,
  linodeRequestPayload
) => {
  return Promise.all([
    createStackScript(stackScriptRequestPayload),
    createLinode(linodeRequestPayload),
  ]);
};

const checkPasswordComplexity = (rootPassword: string) => {
  const weakPassword = '123';
  const fairPassword = 'Akamai123';

  // weak or fair root password cannot rebuild the linode
  cy.get('[id="root-password"]').clear().type(weakPassword);
  ui.button.findByTitle('Rebuild Linode').should('be.enabled').click();
  cy.contains('Password does not meet complexity requirements.');

  cy.get('[id="root-password"]').clear().type(fairPassword);
  ui.button.findByTitle('Rebuild Linode').should('be.enabled').click();
  cy.contains('Password does not meet complexity requirements.');

  // Only strong password is allowed to rebuild the linode
  cy.get('[id="root-password"]').type(rootPassword);
  ui.button.findByTitle('Rebuild Linode').should('be.enabled').click();
};

authenticate();
describe('rebuild linode', () => {
  const image = 'Alpine 3.18';
  const rootPassword = randomString(16);

  before(() => {
    cleanUp(['linodes', 'stackscripts']);
  });

  it('rebuilds a linode from Image', () => {
    createLinode().then((linode) => {
      cy.visitWithLogin(`/linodes`);
      cy.get(`[data-qa-linode="${linode.label}"]`)
        .should('be.visible')
        .within(() => {
          cy.findByText('Running');
        });

      cy.intercept(
        'POST',
        apiMatcher(`linode/instances/${linode.id}/rebuild`)
      ).as('linodeRebuild');
      cy.visitWithLogin(`/linodes/${linode.id}?rebuild=true`);
      cy.get('[data-qa-enhanced-select="From Image"]').within(() => {
        containsClick('From Image').type('From Image{enter}');
      });
      cy.get('[data-qa-enhanced-select="Choose an image"]').within(() => {
        containsClick('Choose an image').type(`${image}{enter}`);
      });
      cy.get('[id="linode-label"]').type(linode.label);

      checkPasswordComplexity(rootPassword);

      cy.wait('@linodeRebuild');
      cy.contains('REBUILDING').should('be.visible');
    });
  });

  it('rebuilds a linode from Community StackScript', () => {
    const stackScriptId = '443929';
    const stackScriptName = 'OpenLiteSpeed-WordPress';
    const image = 'AlmaLinux 9';

    createLinode().then((linode) => {
      cy.visitWithLogin(`/linodes`);
      cy.get(`[data-qa-linode="${linode.label}"]`)
        .should('be.visible')
        .within(() => {
          cy.findByText('Running');
        });

      cy.intercept(
        'POST',
        apiMatcher(`linode/instances/${linode.id}/rebuild`)
      ).as('linodeRebuild');
      cy.visitWithLogin(`/linodes/${linode.id}?rebuild=true`);
      interceptGetStackScripts().as('getStackScripts');
      cy.get('[data-qa-enhanced-select="From Image"]').within(() => {
        containsClick('From Image').type('From Community StackScript{enter}');
      });
      cy.wait('@getStackScripts');
      // Search the corresponding community stack script
      cy.get('[id="search-by-label,-username,-or-description"]')
        .click()
        .type(`${stackScriptName}{enter}`);
      getClick(`[id="${stackScriptId}"][type="radio"]`);
      cy.get('[data-qa-enhanced-select="Choose an image"]').within(() => {
        containsClick('Choose an image').type(`${image}{enter}`);
      });
      cy.get('[id="linode-label"]').type(linode.label);

      checkPasswordComplexity(rootPassword);

      cy.wait('@linodeRebuild');
      cy.contains('REBUILDING').should('be.visible');
    });
  });

  it('rebuilds a linode from Account StackScript', () => {
    const image = 'Alpine';
    const region = 'us-east';

    // Create a StackScript to rebuild a Linode.
    const linodeRequest = createLinodeRequestFactory.build({
      label: randomLabel(),
      region: region,
      image: 'linode/alpine3.18',
      root_pass: randomString(16),
    });

    const stackScriptRequest = {
      label: randomLabel(),
      description: randomString(),
      ordinal: 0,
      logo_url: '',
      images: ['linode/alpine3.18'],
      deployments_total: 0,
      deployments_active: 0,
      is_public: false,
      mine: true,
      rev_note: '',
      script: '#!/bin/bash\n\necho "Hello, world!"',
      user_defined_fields: [],
    };

    cy.defer(
      createStackScriptAndLinode(stackScriptRequest, linodeRequest),
      'creating stackScript and linode'
    ).then(([stackScript, linodeBody]) => {
      const linode = linodeBody.body;
      cy.visitWithLogin(`/linodes`);
      cy.get(`[data-qa-linode="${linode.label}"]`)
        .should('be.visible')
        .within(() => {
          cy.findByText('Running');
        });

      cy.intercept(
        'POST',
        apiMatcher(`linode/instances/${linode.id}/rebuild`)
      ).as('linodeRebuild');
      cy.visitWithLogin(`/linodes/${linode.id}?rebuild=true`);
      cy.get('[data-qa-enhanced-select="From Image"]').within(() => {
        containsClick('From Image').type('From Account StackScript{enter}');
      });
      cy.get('[id="search-by-label,-username,-or-description"]')
        .click()
        .type(`${stackScript.label}{enter}`);
      getClick(`[id="${stackScript.id}"][type="radio"]`);
      cy.get('[data-qa-enhanced-select="Choose an image"]').within(() => {
        containsClick('Choose an image').type(`${image}{enter}`);
      });
      cy.get('[id="linode-label"]').type(linode.label);

      checkPasswordComplexity(rootPassword);

      cy.wait('@linodeRebuild');
      cy.contains('REBUILDING').should('be.visible');
    });
  });

  it('cannot rebuild a provisioning linode', () => {
    createLinode().then((linode) => {
      cy.intercept(
        'POST',
        apiMatcher(`linode/instances/${linode.id}/rebuild`)
      ).as('linodeRebuild');
      cy.visitWithLogin(`/linodes/${linode.id}?rebuild=true`);
      cy.get('[data-qa-enhanced-select="From Image"]').within(() => {
        containsClick('From Image').type('From Image{enter}');
      });
      cy.get('[data-qa-enhanced-select="Choose an image"]').within(() => {
        containsClick('Choose an image').type(`${image}{enter}`);
      });
      cy.get('[id="linode-label"]').type(linode.label);
      cy.get('[id="root-password"]').type(rootPassword);
      ui.button.findByTitle('Rebuild Linode').should('be.enabled').click();
      cy.wait('@linodeRebuild');
      cy.contains('Linode busy.');
    });
  });
});
