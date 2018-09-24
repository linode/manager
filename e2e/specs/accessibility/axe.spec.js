const { constants } = require('../../constants');

import { flatten, sortBy } from 'lodash';
import { axeTest } from '../../utils/accessibility';
import { writeFileSync } from 'fs';

describe('Example Accessibility Test', () => {
    it('should run an axe-core accessibility test', () => {
        function removeDuplicateRoutes(array) {
            const uniqueArray = array.filter((el, index, self) => {
                return index == self.indexOf(el);
            });
            return uniqueArray; 
        }

        const routesArray = removeDuplicateRoutes(flatten(Object.values(constants.routes).map(el => {if (typeof el === "object") { return Object.values(el) } return el;})));
        const resultsFilePath = `./e2e/test-results/${new Date().getTime()}-axe-results.json`;
        
        let results = [];

        routesArray.forEach(route => {
            browser.url(route);

            const testResults = axeTest();
            testResults.forEach(res => res['manager-route'] = route);
            results = results.concat(testResults);
        });

        results = sortBy(sortBy(results, o => o.impact), o => o.impact !== 'critical');

        writeFileSync(resultsFilePath, JSON.stringify(results));
        console.log(`\nAccessibility test results saved to ${resultsFilePath} !`);
    });
});
