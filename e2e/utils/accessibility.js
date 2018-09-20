const axeSource = require('axe-core').source;

export const axeTest = () => {

    browser.execute(axeSource);
    
    const testResults = browser.executeAsync(function(done) {
        axe.run(function(err, results) {
            done(results);
        });
    });

    const sortedViolations =
        testResults.value.violations.sort(function(a,b) {
            if (a.impact < b.impact) {
                return -1;
            } 
            return 0;
        });

    return sortedViolations;
}
