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
import { baseApps } from '../../../../src/features/StackScripts/stackScriptUtils';

import type { Config, Linode, StackScript } from '@linode/api-v4';
import { OCA } from '@src/features/OneClickApps/types';
import { FlagSet } from '@src/featureFlags';

authenticate();

describe('OneClick Apps (OCA)', () => {
  beforeEach(() => {
    cleanUp(['linodes']);
  });

  it('Lists all the OneClick Apps', () => {
    interceptGetStackScripts().as('getStackScripts');
    interceptFeatureFlags().as('getFeatureFlags');

    cy.visitWithLogin(`/linodes/create?type=One-Click`);

    let flags: FlagSet = {};
    cy.wait('@getFeatureFlags').then((xhr) => {
      flags = xhr.response?.body ?? {};

      cy.wait('@getStackScripts').then((xhr) => {
        const stackScripts: StackScript[] = xhr.response?.body.data ?? [];
        const newApps = flags['one-click-apps']?.value;

        const trimmedApps = filterOneClickApps({
          baseApps,
          newApps,
          queryResults: stackScripts,
        });

        console.log('trimmedApps', trimmedApps);

        cy.findByTestId('one-click-apps-container').within(() => {
          trimmedApps.forEach((stackScript) => {
            const { label } = handleAppLabel(stackScript);

            cy.get(`[data-qa-select-card-heading="${label}"]`).should('exist');
          });
        });
      });
    });
  });
});
