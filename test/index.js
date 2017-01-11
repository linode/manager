import zxcvbn from 'zxcvbn';
window.zxcvbn = zxcvbn;

const testsContext = require.context('.', true, /spec.js$/);
testsContext.keys().forEach(testsContext);
