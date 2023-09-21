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

        const allowedApps = Object.keys({
          ...baseApps,
          ...newApps,
        });
        const filteredApps = stackScripts.filter((app) => {
          return (
            !app.label.match(/helpers/i) && allowedApps.includes(String(app.id))
          );
        });

        console.log('filteredApps TEST', filteredApps);

        cy.findByTestId('one-click-apps-container').within(() => {
          filteredApps.forEach((stackScript) => {
            // console.log(stackScript);
            // containsVisible(stackScript.label);
          });
        });
      });
    });
  });
});
