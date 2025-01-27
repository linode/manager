import { mockGetCluster, mockGetKubeconfig } from 'support/intercepts/lke';
import { kubernetesClusterFactory } from 'src/factories';
import { readDownload } from 'support/util/downloads';

const mockKubeconfigContents = '---'; // Valid YAML.
const mockKubeconfigResponse = {
  kubeconfig: btoa(mockKubeconfigContents),
};

const mockCluster = kubernetesClusterFactory.build();
const url = `/kubernetes/clusters/${mockCluster.id}`;

describe('LKE summary page', () => {
  beforeEach(() => {
    mockGetCluster(mockCluster).as('getCluster');
    mockGetKubeconfig(mockCluster.id, mockKubeconfigResponse).as(
      'getKubeconfig'
    );
  });

  it('can download kubeconfig', () => {
    const mockKubeconfigFilename = `${mockCluster.label}-kubeconfig.yaml`;
    cy.visitWithLogin(url);
    cy.wait(['@getCluster']);
    cy.get(`p:contains(${mockKubeconfigFilename})`)
      .should('be.visible')
      .should('be.enabled')
      .click();
    cy.wait('@getKubeconfig');
    readDownload(mockKubeconfigFilename).should('eq', mockKubeconfigContents);
  });

  it('can view kubeconfig contents', () => {
    cy.visitWithLogin(url);
    cy.wait(['@getCluster']);
    // open drawer
    cy.get('p:contains("View")')
      .should('be.visible')
      .should('be.enabled')
      .click();
    cy.wait('@getKubeconfig');
    cy.findByTestId('drawer-title').should('be.visible');
    cy.get('code')
      .should('be.visible')
      .within(() => {
        cy.get('span').contains(mockKubeconfigContents);
      });
  });

  // TODO: add test for failure to download yaml file
});
