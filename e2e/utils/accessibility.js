const axeSource = require('axe-core').source;

export const axeTest = () => {

    browser.execute(axeSource);
    
    const testResults = browser.executeAsync(function(done) {
        axe.run(function(err, results) {
            done(results);
        });
    });

    const criticalErrors = testResults.value.violations.filter(v => v.impact === 'critical');

    return criticalErrors;
}