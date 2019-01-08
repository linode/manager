const { constants } = require('../../constants');
import { switchTab } from '../../utils/common';
import SupportLanding from '../../pageobjects/support/landing.page.js';
import SupportSearchLanding from '../../pageobjects/support/search-landing.page.js';

xdescribe('Support Search - Suite', () => {
    beforeAll(() => {
        browser.url(constants.routes.support.landing);
        SupportLanding.baseElemsDisplay();
    });

    const filterSearchResults = (resultType) => {
        return SupportLanding.searchResults.filter(result => result.getAttribute(SupportLanding.searchResultLinkType) === resultType);
    }

    const scrollDownResultList = (numberOfScrolls) => {
        for(let i = 0; i < numberOfScrolls; i++){
            SupportLanding.searchField.addValue('\ue015');
        }
    }

    const checkDocumentationLink = (articleTitle) => {
        switchTab();
        expect(browser.getTitle()).toEqual(articleTitle.trim());
        expect(browser.getUrl()).toContain('/docs/');
        browser.close();
        $('body').click();
    }

    const checkCommuntitySiteLink = (postTitle) => {
        switchTab();
        expect(browser.getTitle()).toEqual(`${postTitle.trim()} | Linode Questions`);
        expect(browser.getUrl()).toContain('/community/questions/');
        browser.close();
        $('body').click();
    }

    it('Search bar displays results for Documentation and Community Site', () => {
        SupportLanding.search('cloud');
        const documentationLinks = filterSearchResults('Linode documentation');
        const communityLinks = filterSearchResults('Linode Community Site');
        const searchLandingPage = filterSearchResults('finalLink');
        expect(documentationLinks.length).toBe(10);
        expect(communityLinks.length).toBe(10);
        expect(searchLandingPage.length).toBe(1);
    });

    it('Linode Documentation search result links to the Documentation site', () => {
        const documentationLink = filterSearchResults('Linode documentation')[0];
        const article = documentationLink.$('div>div').getText();
        documentationLink.click();
        checkDocumentationLink(article);
    });

    it('Linode Community Site search results links to the Community site', () => {
        SupportLanding.search('cloud');
        scrollDownResultList(15);
        const communitySiteLink = filterSearchResults('Linode Community Site')[0];
        const post = communitySiteLink.$('div>div').getText();
        communitySiteLink.click();
        checkCommuntitySiteLink(post);
    });

    describe('Support Search Landing Page', () => {
        const searchTerm = 'test';
        const verifyViewMoreNavigation = (pageTitle, expectedUrlPath) => {
            browser.waitUntil(() => {
                return browser.getTitle() === pageTitle;
            }, constants.wait.normal);
            expect(browser.getUrl()).toContain(expectedUrlPath);
            browser.back();
            SupportSearchLanding.searchLandingDisplays();
        }
        //TODO replace with proper search test after v0.43.0 is merged into develop
        beforeAll(() => {
            SupportLanding.searchField.setValue(searchTerm);
            SupportLanding.searchField.addValue(SupportLanding.enterKey);
            SupportSearchLanding.searchLandingDisplays();
        });

        it('Search landing page displays first 5 results of Documentation and Community Site', () =>{
            expect(SupportSearchLanding.resultSet('Documentation').length).toBe(5);
            expect(SupportSearchLanding.resultSet('Community Posts').length).toBe(5);
        });

        it('Linode Documentation search result links to the Documentation site', () => {
            const documentationLink = SupportSearchLanding.resultSet('Documentation')[0];
            const articleTitle = documentationLink.getText();
            documentationLink.click();
            checkDocumentationLink(articleTitle);
        });

        it('Linode Community Site search results links to the Community site', () => {
            const communityPost = SupportSearchLanding.resultSet('Community Posts')[0];
            const post = communityPost.getText();
            communityPost.click();
            checkCommuntitySiteLink(post);
        });

        it('View more Documentation links to the Linode Documentation search page', () => {
            SupportSearchLanding.viewMoreDocumentation.click();
            verifyViewMoreNavigation('Search Linode Docs','/docs/search');
        });

        it('View more Community links to the Linode Community search page', () => {
            SupportSearchLanding.viewMoreCommunity.click();
            verifyViewMoreNavigation(`Linode Questions matching ${searchTerm}`,'/community/questions/search');
        });

    });
});
