import { createLinode } from 'support/api/linodes';
import { containsVisible } from 'support/helpers';
import { ui } from 'support/ui';
import { authenticate } from 'support/api/authentication';
import { cleanUp } from 'support/util/cleanup';
import { interceptRebootLinode } from 'support/intercepts/linodes';
import { interceptGetStackScripts } from 'support/intercepts/stackscripts';
import {
  interceptDeleteLinodeConfig,
  interceptCreateLinodeConfigs,
  interceptUpdateLinodeConfigs,
} from 'support/intercepts/configs';
import {
  createLinodeAndGetConfig,
  createAndBootLinode,
} from 'support/util/linode-utils';
import {
  filterOneClickApps,
  handleAppLabel,
} from '../../../../src/features/Linodes/LinodesCreate/utilities';
import { interceptFeatureFlags } from 'support/intercepts/feature-flags';
import { mapStackScriptLabelToOCA } from '../../../../src/features/OneClickApps/utils';
import { baseApps } from '../../../../src/features/StackScripts/stackScriptUtils';
import { oneClickApps } from '../../../../src/features/OneClickApps/OneClickApps';
import type { Config, Linode, StackScript } from '@linode/api-v4';
import { OCA } from '@src/features/OneClickApps/types';
import type { FlagSet } from '@src/featureFlags';

authenticate();

describe('OneClick Apps (OCA)', () => {
  before(() => {
    cleanUp(['linodes']);
  });

  it('Lists all the OneClick Apps, by category, and ensure their respective drawer open', () => {
    interceptGetStackScripts().as('getStackScripts');
    interceptFeatureFlags().as('getFeatureFlags');

    cy.visitWithLogin(`/linodes/create?type=One-Click`);

    let flags: FlagSet = {};
    cy.wait('@getFeatureFlags').then((xhr) => {
      flags = xhr.response?.body ?? {};

      cy.wait('@getStackScripts').then((xhr) => {
        const stackScripts: StackScript[] = xhr.response?.body.data ?? [];
        const newApps = flags['one-click-apps']?.value;

        const trimmedApps: StackScript[] = filterOneClickApps({
          baseApps,
          newApps,
          queryResults: stackScripts,
        });

        cy.findByTestId('one-click-apps-container').within(() => {
          trimmedApps.forEach((stackScript) => {
            const { decodedLabel, label } = handleAppLabel(stackScript);

            // Check that every OCA is listed with the correct label
            cy.get(`[data-qa-select-card-heading="${label}"]`).should('exist');

            // Check that every OCA has a drawer match
            expect(
              mapStackScriptLabelToOCA({
                oneClickApps,
                stackScriptLabel: decodedLabel,
              })
            ).to.not.be.undefined;
          });
        });

        // Check one of the OCA drawers
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
      });
    });
  });
});
