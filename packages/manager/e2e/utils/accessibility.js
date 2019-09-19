const axeSource = require('axe-core').source;

export const axeTest = () => {
  browser.execute(axeSource);

  const testResults = browser.executeAsync(function(done) {
    axe.run(function(err, results) {
      done(results);
    });
  });

  return testResults.value.violations;
};
