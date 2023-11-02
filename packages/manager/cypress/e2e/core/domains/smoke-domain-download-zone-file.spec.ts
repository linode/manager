import {
  domainFactory,
  domainRecordFactory,
  domainZoneFileFactory,
} from '@src/factories';
import { authenticate } from 'support/api/authentication';
import { fbtClick, fbtVisible } from 'support/helpers';
import {
  mockGetDomains,
  mockGetDomain,
  mockGetDomainRecords,
  mockGetDomainZoneFile,
} from 'support/intercepts/domains';
import { randomDomainName } from 'support/util/random';
import { readDownload } from 'support/util/downloads';
import { ui } from 'support/ui';
import { cleanUpDownloadFiles } from 'support/util/downloads';

authenticate();
describe('Download a Zone file', () => {
  before(() => {
    cleanUpDownloadFiles();
  });

  /*
   * - Clicks "Import A Zone" button and confirms operation.
   * - Confirms that Domain won't be imported when the domain is empty or invalid.
   * - Confirms that Domain won't be imported when the name server is empty or invalid.
   * - Confirms that Domain exists after imported operation.
   */
  it('downloads a zone in the domain page', () => {
    const mockDomain = domainFactory.build({
      id: 123,
      domain: randomDomainName(),
      group: 'test-group',
    });
    const mockDomainRecords = domainRecordFactory.build();
    const mockDomainZoneFile = domainZoneFileFactory.build();
    const mockZoneFileContents = mockDomainZoneFile.zone_file.join('\n');

    cy.visitWithLogin('/domains');
    ui.button
      .findByTitle('Import a Zone')
      .should('be.visible')
      .should('be.enabled')
      .click();

    mockGetDomains(mockDomain).as('getDomains');
    cy.visitWithLogin('/domains');
    cy.wait('@getDomains');

    mockGetDomain(mockDomain.id, mockDomain).as('getDomain');
    mockGetDomainRecords(mockDomainRecords).as('getDomainRecords');
    fbtVisible(mockDomain.domain);
    fbtClick(mockDomain.domain);
    cy.wait('@getDomain');
    cy.wait('@getDomainRecords');

    mockGetDomainZoneFile(mockDomain.id, mockDomainZoneFile).as(
      'getDomainZoneFile'
    );
    ui.button
      .findByTitle('Download DNS Zone File')
      .should('be.visible')
      .click();
    cy.wait('@getDomainZoneFile');

    readDownload(`${mockDomain.domain}.txt`).should('eq', mockZoneFileContents);
  });
});
