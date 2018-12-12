const { constants } = require('../constants');

import Page from './page';

class SearchResults extends Page {

    headerSelector(entityTitle){
        return $(`[data-qa-entity-header=${entityTitle}]`)
    }
}

export default new SearchResults();
