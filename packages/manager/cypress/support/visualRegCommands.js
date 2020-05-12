// Command
const checkIsInsideViewport = elem => {
  const height = Cypress.$(cy.state('window')).height();
  const width = Cypress.$(cy.state('window')).width();
  const rect = elem[0].getBoundingClientRect();

  expect(rect.top, 'element top not above viewport').to.be.greaterThan(0);
  expect(rect.bottom, 'element bottom not below viewport').to.be.lessThan(
    height
  );
  expect(rect.left, 'element left not left of viewport').to.be.greaterThan(0);
  expect(rect.right, 'element right not right of viewport').to.be.lessThan(
    width
  );
};

Cypress.Commands.add(
  'checkSnapshot',
  { prevSubject: 'optional' },
  (subject, name, threshold = 0.0) => {
    // checking that our element, is well within viewport boundaries
    expect(subject).not.to.be.null;

    if (subject.length !== 1) {
      cy.log(
        `the subject must be an element not a colleciton, consider using first()`
      );
      return cy.wrap(false);
    }
    checkIsInsideViewport(subject);

    // cy.positionToViewport(subject, 'inside');
    const visualRegMode =
      Cypress.env('visualRegMode') === 'record' ? 'record' : 'actual';

    const nameAndSize = `${name}-${Cypress.config().viewportWidth}-${
      Cypress.config().viewportHeight
    }`;

    const recordScreenShotName = `record-${nameAndSize}`;
    const actualScreenShotName = `actual-${nameAndSize}`;
    const diffScreenShotName = `diff-${nameAndSize}`;
    const toFilename = name =>
      `${Cypress.config('screenshotsFolder')}/${Cypress.spec.name}/${name}.png`;

    if (visualRegMode === 'record') {
      cy.task('deleteVisualRegFiles', {
        files: [toFilename(recordScreenShotName)]
      });
    } else {
      cy.task('deleteVisualRegFiles', {
        files: [
          toFilename(actualScreenShotName),
          toFilename(diffScreenShotName)
        ]
      });
    }

    // take snapshot
    const screenshotName =
      visualRegMode === 'record' ? recordScreenShotName : actualScreenShotName;

    cy.get(subject).screenshot(screenshotName);

    // run visual tests
    if (visualRegMode === 'actual') {
      const options = {
        actualImage: toFilename(actualScreenShotName),
        diffImage: toFilename(diffScreenShotName),
        expectedImage: toFilename(recordScreenShotName)
      };
      // cy.log('SP opt', options);
      cy.task('compareSnapshotsPlugin', options).then(res => {
        if (res.error) {
          throw res.error;
        }
        // cy.log('compareSP res', results);
        return cy.wrap(res.result.percentage <= threshold);
      });
    } else {
      return cy.wrap(true);
    }
  }
);
