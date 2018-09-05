const { constants } = require('../../constants');

import Page from '../page';

export class SupportLanding extends Page {
    get searchHeading() { return $('[data-qa-search-heading]'); }
    get searchField() { return $('[data-qa-enhanced-select] input'); }
    get docLink() { return $('[data-qa-doc-link]'); }
    get docLinks() { return $$('[data-qa-doc-link]'); }
    get communityPost() { return $('[data-qa-community-post]'); }
    get communityPosts() { return $$('[data-qa-community-post]'); }
    get viewDocsTile() { return $('[data-qa-tile="View Documentation"]'); }
    get communityTile() { return $('[data-qa-tile="Search the Community"]'); }
    get adaTile() { return $('[data-qa-tile="Talk to Ada"]'); }
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
}

export default new SupportLanding();
