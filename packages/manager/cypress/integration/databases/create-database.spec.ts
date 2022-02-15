import { makeDatabaseClusterLabel } from '../../support/api/databases';
import {
  containsClick,
  containsVisible,
  fbtClick,
  fbtVisible,
  getClick,
} from '../../support/helpers';

describe('create a database', () => {
  it('can navigate to the database page', () => {
    const clusterLabel = makeDatabaseClusterLabel();
    const engine = 'MySQL v8.0.26';
    const region = 'Newark';

    cy.visitWithLogin('/databases/create');
    cy.get('[data-qa-header="Create"]').should('have.text', 'Create');

    containsClick('Cluster Label').type(clusterLabel);
    containsClick('Select a Database Engine').type(`${engine} {enter}`);
    containsClick('Select a Region').type(`${region} {enter}`);

    fbtClick('Shared CPU');
    getClick('[id="g6-nanode-1"]');
    containsClick('1 Node');
    fbtClick('Create Database Cluster');
  });
});
