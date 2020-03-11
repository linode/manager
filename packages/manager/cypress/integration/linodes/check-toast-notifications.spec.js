import { stubLinodeEvent } from '../../support/api/events';
import { checkToast } from '../../support/ui/events';
import { makeLinodeLabel } from '../../support/api/linodes';

describe('Toast Notifications', () => {
  beforeEach(() => {
    cy.login2();
    cy.visit('/linodes');
    cy.server();
  });
  it('linode_config_create fail', () => {
    stubLinodeEvent({ action: 'linode_config_create', status: 'failed' });
    checkToast('Error creating config');
  });
  it('disk_delete', () => {
    stubLinodeEvent({ action: 'disk_delete', status: 'failed' });
    checkToast('Unable to delete Disk');
  });

  // We apparently do not respond to events from API on this ...
  describe.skip('create Linode', () => {
    beforeEach(() => {
      //this snack exist only if the LinodeCreate Component is loaded
      cy.visit('/linodes/create');
      // wait for page to be loaded
      cy.get('[data-qa-deploy-linode]');
    });
    const linodeLabel = makeLinodeLabel();

    const messages = [
      {
        data: {
          action: 'linode_create',
          status: 'started',
          label: linodeLabel
        },
        message: `Your Linode ${linodeLabel} is being created.`
      },
      {
        data: {
          action: 'linode_create',
          status: 'scheduled',
          label: linodeLabel
        },
        message: `Linode ${linodeLabel} is scheduled for creation.`
      }
    ];
    messages.forEach(m => {
      it(m.data.status, () => {
        stubLinodeEvent(m.data);
        checkToast(m.message);
      });
    });
  });
});
