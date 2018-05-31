const { constants } = require('../../constants');

import Page from '../page';

class DomainDetail extends Page {
    get domainTitle() { return $('[data-qa-domain-title]'); }
}

export default new DomainDetail();
