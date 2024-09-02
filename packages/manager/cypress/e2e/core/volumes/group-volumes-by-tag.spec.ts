import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';
import { chooseRegion } from 'support/util/regions';
import { randomLabel } from 'support/util/random';
import { volumeRequestPayloadFactory } from 'src/factories';
import { createVolume } from '@linode/api-v4';
import { authenticate } from 'support/api/authentication';
import { apiMatcher } from 'support/util/intercepts';

const tags = new Array(2).fill(0).map(() => randomLabel(3));

function createVolumesForTest() {
  const mockVolumeRequests = new Array(5).fill(0).map((_, idx) => {
    const volumeRequest = volumeRequestPayloadFactory.build({
      label: randomLabel(),
      region: chooseRegion().id,
      tags: idx !== 4 ? [tags[idx % 2]] : [],
    });

    return createVolume(volumeRequest);
  });

  return Promise.all(mockVolumeRequests);
}

authenticate();
describe('Group Volumes by tag', () => {
  before(() => {
    cleanUp(['volumes', 'linodes']);
  });

  it('should group volumes by tag', () => {
    cy.defer(() => createVolumesForTest(), 'creating volumes').then(() => {
      cy.visitWithLogin('/volumes');

      ui.button.findByAttribute('data-testid', 'group-by-tag').click();

      cy.intercept('PUT', apiMatcher('profile/preferences'), (req) => {
        expect(req.body.volumes_group_by_tag).to.be.true;
        req.continue((res) => res.body);
      });

      tags.forEach((tag) => {
        cy.findByText(tag).should('be.visible');
      });

      cy.findByText('No Tags').should('be.visible');
    });
  });

  after(() => {
    cleanUp(['volumes', 'linodes']);
  });
});
