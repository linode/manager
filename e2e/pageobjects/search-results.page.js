const { constants } = require('../constants');

import Page from './page';

class SearchResults extends Page {

    headerSelector(entityType){
        return `[data-qa-entity-header=${entityType}]`;
    }

    headerElement(entityType){
       return $(this.headerSelector(entityType));
    }

    resultSelector(entityName){
        return `[data-qa-result-row="${entityName}"]`;
    }

    resultTagsSelector(entityName){
        return `${this.resultSelector(entityName)} ${this.tag.selector}`;
    }

    resultElement(entityName){
       return $(this.resultSelector(entityName));
    }

    waitForSearchResult(entityType,entityName){
        this.headerElement(entityType).waitForVisible(constants.wait.normal);
        this.resultElement(entityName).waitForVisible(constants.wait.normal);
    }

    getTagsAppliedToResult(entityName){
        $(this.resultTagsSelector(entityName)).waitForVisible(constants.wait.normal);
        return $$(this.resultTagsSelector(entityName)).map(tag => tag.getText());
    }
}

export default new SearchResults();
