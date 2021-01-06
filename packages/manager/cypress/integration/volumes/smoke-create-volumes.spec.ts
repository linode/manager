/* eslint-disable sonarjs/no-duplicate-string */
import {
  makeVolumeLabel,
  deleteAllTestVolumes,
  clickVolumeActionMenu,
  createVolume,
  deleteVolumeById
} from '../../support/api/volumes';
import { assertToast } from '../../support/ui/events';
import {
  createLinode,
  deleteAllTestLinodes,
  deleteLinodeById
} from '../../support/api/linodes';
import { selectRegionString } from '../../support/ui/constants';
import {
  containsClick,
  containsVisible,
  fbtClick,
  fbtVisible,
  getClick,
  getVisible
} from '../../support/helpers';

const urlExtension = '/volumes/create';
const tag = 'cy-test';
const region = 'Newark, NJ';
const clickCreate = () => {
  getClick('[data-qa-deploy-linode]');
};
const getVolumeLabelInput = () => {
  return cy.findAllByLabelText('Label (required)');
};
const clickDetach = () => {
  getClick('[data-qa-action-menu-item="Detach"]:visible');
};

const createBasicVolume = (linodeLabel?: string) => {
  const volLabel = makeVolumeLabel();
  cy.intercept('POST', '*/volumes').as('volumeCreated');
  cy.visitWithLogin(urlExtension);
  cy.findByText('volumes');
  clickCreate();
  fbtVisible('Label is required.');
  getVolumeLabelInput().type(volLabel);
  /* validating that volume won't create without region.
       region not necessary if attaching linode */
  clickCreate();
  fbtVisible('Must provide a region or a Linode ID.');
  if (linodeLabel) {
    fbtClick('Select a Linode').type(`${linodeLabel} {enter}`);
    cy.findByText('My Debian 10 Disk Profile');
  } else {
    fbtClick(selectRegionString).type('new {enter}');
  }
  fbtClick('Type to choose or create a tag.').type(`${tag} {enter}`);
  clickCreate();
  return cy.wait('@volumeCreated').then(xhr => {
    expect(xhr.response?.statusCode).to.equal(200);
    return { label: volLabel, id: xhr.response?.body['id'] };
  });
};

const validateBasicVolume = (volLabel: string, volId: string) => {
  containsVisible('Volume Configuration');
  cy.findByDisplayValue(`mkdir "/mnt/${volLabel}"`);
  containsClick('Close');
  // assertToast(`Volume ${volLabel} successfully created.`);
  fbtVisible(volLabel);
  cy.get(`[data-qa-volume-cell="${volId}"]`).within(() => {
    fbtVisible(region);
  });
  cy.get(`[data-qa-volume-cell="${volId}"]`).within(() => {
    fbtVisible('Unattached');
  });
};

describe('volumes', () => {
  it('creates a volume without linode', () => {
    createBasicVolume().then(({ label, id }) => {
      validateBasicVolume(label, id);
      clickVolumeActionMenu(label);
      getVisible('[data-qa-action-menu-item="Delete"]');
      deleteAllTestLinodes();
      deleteAllTestVolumes();
    });
  });

  it('Detaches attached volume', () => {
    cy.visitWithLogin('/volumes');
    createLinode().then(linode => {
      const linodeId = linode.id;
      const linodeLabel = linode.label;
      createVolume(linodeId).then(volume => {
        const volumeId = volume.id;
        cy.intercept('POST', '*/volumes/' + volume.id + '/detach').as(
          'volumeDetached'
        );
        const volumeLabel = volume.label;
        cy.reload();
        containsVisible(linodeLabel);
        containsVisible(volumeLabel);
        clickVolumeActionMenu(volume.label);
        clickDetach();
        cy.findByText(
          `Are you sure you want to detach this Volume from ${linodeLabel}?`
        );
        getClick('[data-qa-confirm="true"]');
        cy.wait('@volumeDetached')
          .its('response.statusCode')
          .should('eq', 200);
        assertToast('Volume detachment started', 2);
        deleteLinodeById(linodeId);
        deleteVolumeById(volumeId);
        deleteAllTestLinodes();
        deleteAllTestVolumes();
      });
    });
  });
});
