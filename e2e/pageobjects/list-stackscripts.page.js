const { constants } = require('../constants');

import Page from './page.js';
import ConfigureLinode from './configure-linode';

class ListStackScripts extends Page {

    get header() { return $('[data-qa-title]'); }
    get create() { return $('[data-qa-icon-text-link="Create New StackScript"]'); }

    get selectStackScriptHeader() { return $('[data-qa-tp="Select StackScript"]'); }
    get myStackScriptTab() { return $('[data-qa-tab="My StackScripts"]'); }
    get linodeStackScriptTab() { return $('[data-qa-tab="Linode StackScripts"]'); }
    get communityStackScriptTab() { return $('[data-qa-tab="Community StackScripts"]'); }


    get emptyMsg() { return $('[data-qa-stackscript-empty-msg]'); }

    get stackScriptTable() { return $('[data-qa-tp]'); }
    get stackScriptTableHeader() { return $('[data-qa-stackscript-table-header]'); }
    get stackScriptDeploysHeader() { return $('[data-qa-stackscript-active-deploy-header]'); }
    get stackScriptRevisionsHeader() { return $('[data-qa-stackscript-revision-header]'); }
    get stackScriptCompatibleImagesHeader() { return $('[data-qa-stackscript-compatible-images]'); }

    get stackScriptRow() { return $('[data-qa-table-row]'); }
    get stackScriptRows() { return $$('[data-qa-table-row]'); }
    get stackScriptTitle() { return $('[data-qa-stackscript-title]'); }
    get stackScriptDeploys() { return $('[data-qa-stackscript-deploys]'); }
    get stackScriptActionMenu() { return $('[data-qa-action-menu]'); }
    get stackScriptActionMenuLink() { return $('[data-qa-action-menu-link]'); }
    get stackScriptRevision() { return $('[data-qa-stackscript-revision]'); }

    get docsHelperLink() { return $('[data-qa-doc]'); }

    baseElementsDisplay() {
        this.header.waitForVisible();
        expect(this.sidebarTitle.isVisible()).toBe(true);
        expect(this.stackScriptTable.isVisible()).toBe(true);
        expect(this.header.getText()).toBe('StackScripts');
        expect(this.create.isVisible()).toBe(true);
        expect(this.create.getTagName()).toBe('button');
        expect(this.myStackScriptTab.isVisible()).toBe(true);
        expect(this.linodeStackScriptTab.isVisible()).toBe(true);
        expect(this.communityStackScriptTab.isVisible()).toBe(true);
    }

    stackScriptTableDisplay() {
        // Reuse Configure Linode Stackscript table display utility
        return ConfigureLinode.stackScriptTableDisplay();
    }

    stackScriptMetadataDisplay() {
        return ConfigureLinode.stackScriptMetadataDisplay();
    }

}

export default new ListStackScripts();
