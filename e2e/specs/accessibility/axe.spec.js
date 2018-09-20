const { constants } = require('../../constants');

import { axeTest } from '../../utils/accessibility';
import { writeFileSync } from 'fs';


describe('Example Accessibility Test', () => {
    beforeAll(() => {
        browser.url(constants.routes.dashboard);
    });

    it('should run an axe-core accessibility test', () => {
        const routesArray = _.flatten(Object.values(constants.routes).map(el => {if (typeof el === "object") { return Object.values(el) } return el;}));
        const results = [];
        const resultsFilePath = `./e2e/test-results/${new Date().getTime()}-axe-results.json`;

        routesArray.forEach(route => {
            browser.url(route);
            const testResults = axeTest();
            results.push(testResults);
        });

        writeFileSync(resultsFilePath, JSON.stringify(results));
        console.log(`Results saved to ${resultsFilePath} !`);
    });
});