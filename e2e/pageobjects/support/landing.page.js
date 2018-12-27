const { constants } = require('../../constants');

import Page from '../page';

export class SupportLanding extends Page {
    get searchHeading() { return $('[data-qa-search-heading]'); }
    get searchField() { return $('[data-qa-enhanced-select-input] input'); }
    get searchResultLinkType() { return 'data-qa-search-result'; }
    get searchResult() { return `[${this.searchResultLinkType}]`; }
    get searchResults() { return $$(this.searchResult); }
    get externalLink() { return '[data-qa-external-link]';}
    get docLink() { return $(` [data-qa-documentation-link] ${this.externalLink}`); }
    get docLinks() { return $$(` [data-qa-documentation-link] ${this.externalLink}`); }
    get communityPost() { return $(`[data-qa-community-link] ${this.externalLink}`); }
    get communityPosts() { return $$(`[data-qa-community-link] ${this.externalLink}`); }
    get viewDocsTile() { return $('[data-qa-tile="Guides and Tutorials"]'); }
    get communityTile() { return $('[data-qa-tile="Community Q&A"]'); }
    get adaTile() { return $('[data-qa-tile="Linode Support Bot"]'); }
    get supportTile() { return $('[data-qa-tile="Customer Support"]'); }

    baseElemsDisplay() {
        this.searchHeading.waitForVisible(constants.wait.normal);

        expect(this.searchField.isVisible()).toBe(true);
        expect(this.communityPosts.length).toBe(3);
        expect(this.docLinks.length).toBe(3);

        expect(this.viewDocsTile.isVisible()).toBe(true);
        expect(this.communityTile.isVisible()).toBe(true);
        expect(this.adaTile.isVisible()).toBe(true);
        expect(this.supportTile.isVisible()).toBe(true);
    }

    search(query){
      this.searchField.setValue(query);
      browser.pause(2000);
    }
}

export default new SupportLanding();
