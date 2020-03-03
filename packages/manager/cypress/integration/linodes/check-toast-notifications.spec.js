import { stubEvent } from '../../support/api/events';
import { checkToast } from '../../support/ui/events';

describe('Event - create a linode', () => {
  beforeEach(() => {
    cy.login2();
    cy.visit('/linodes');
    cy.server();
  });
  it('linode_config_create fail', () => {
    stubEvent('linode_config_create', 'failed');
    checkToast('Error creating config');
  });
  it('disk_delete', () => {
    stubEvent('disk_delete', 'failed');
    checkToast('Unable to delete Disk');
  });
});
