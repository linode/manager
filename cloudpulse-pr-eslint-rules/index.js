// eslint-rules/index.js
import noUselessTemplate from './no-useless-template.js';
import noNonNullAssertion from './no-non-null-assertion.js';

export default {
    rules: {
        'no-useless-template': noUselessTemplate,
        'no-non-null-assertion':noNonNullAssertion,
    },
};