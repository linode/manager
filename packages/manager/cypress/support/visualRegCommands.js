Cypress.Commands.add(
  'checkSnapshot',
  { prevSubject: 'optional' },
  (subject, name, threshold, viewport = 'macbook-13') => {
    const visualRegMode =
      Cypress.env('visualRegMode') === 'record' ? 'record' : 'actual';

    const recordScreenShotName = `record-${name}`;
    const actualScreenShotName = `actual-${name}`;
    const diffScreenShotName = `diff-${name}`;
    const toFilename = name =>
      `${Cypress.config('screenshotsFolder')}/${Cypress.spec.name}/${name}.png`;

    // cy.log('mode', visualRegMode);

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
    cy.log('path', screenshotName);

    cy.viewport(viewport);
    if (subject) {
      cy.get(subject).screenshot(screenshotName);
    } else {
      cy.screenshot(screenshotName);
    }

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
