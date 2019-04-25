const { resetAccounts } = require('../setup/cleanup');
const { constants } = require('../constants');

class CredStore {

    // default browser object is a mock to support testing outside the context
    // of running the e2e tests.  when running under e2e browser is passed in via
    // web driver code that bootstraps the tests.
    constructor(shouldCleanupUsingAPI = true, browser = { options: {} }) {
        this.browser = browser;
        this.shouldCleanupUsingAPI = shouldCleanupUsingAPI;
    }
    
    setBrowser(browser) {
        //console.log("setting browser to:");
        //console.log(browser);
        this.browser = browser;
    }

    // not sure if es6 supports abstract methods so using this as a hack to
    // let implementor know that child class must provide an impl for this
    // method.
    getAllCreds() {
        throw "CredStore.getAllCreds() needs to be implemented in child class";
    }

    cleanupAccounts() {
        if (this.shouldCleanupUsingAPI) {
            console.log("cleaning up user resources via API");
            return this.getAllCreds().then((credCollection) => {
                console.log(credCollection);
                return resetAccounts(credCollection);
            });
        } else {
            console.log("not cleaning up resources via API");
            return Promise.resolve(false);
        }
    }

    login(username, password, shouldStoreToken = false) {
        console.log("logging in for user: " + username);
        
        let browser = this.browser;

        browser.url(constants.routes.linodes);
        try {
            browser.waitForVisible('#username', constants.wait.long);
        } catch (err) {
            console.log(browser.getSource());
        }
    
        browser.waitForVisible('#password', constants.wait.long);
        browser.jsClick('#username');
        browser.trySetValue('#username', username);
        browser.jsClick('#password');
        browser.trySetValue('#password', password);

        
        let url = browser.getUrl();

        const loginButton = url.includes('dev') ? '.btn#submit' : '[data-qa-sign-in] input';
        const letsGoButton = url.includes('dev') ? '.btn#submit' : '[data-qa-welcome-button]';
    
        // Helper to check if on the Authorize 3rd Party App
        const isOauthAuthPage = () => {
            /**
             * looking to determine if we're on the oauth/auth page
             */
            try {
                browser.waitForVisible('.oauthauthorize-page', constants.wait.short);
                return true;
            } catch (err) {
                console.log('Not on the Oauth Page, continuing');
                return false;
            }
        }
    
        // Helper to check if CSRF error is displayed on the page
        const csrfErrorExists = () => {
            const sourceIncludesCSRF = browser.getSource().includes('CSRF');
            return sourceIncludesCSRF;
        };
    
        // Click the Login button
        browser.click(loginButton);
    
        const onOauthPage = isOauthAuthPage();
        const csrfError = csrfErrorExists();
    
        // If on the authorize page, click the authorize button
        if (onOauthPage) {
            $('.form-actions>.btn').click();
        }
    
        // If still on the login page, check for a form error
        if (csrfError) {
            // Attempt to Login after encountering the CSRF Error
            browser.trySetValue('#password', password);
            browser.trySetValue('#username', username);
            $(loginButton).click();
        }
    
        // Wait for the add entity menu to exist
        try {
            browser.waitForExist('[data-qa-add-new-menu-button]', constants.wait.normal);
        } catch (err) {
            console.log('Add an entity menu failed to exist', 'Failed to login to the Manager for some reason.');
            console.error(`Current URL is:\n${browser.getUrl()}`);
            console.error(`Page source: \n ${browser.getSource()}`);
        }
    
        // Wait for the welcome modal to display, click it once it appears
        if (browser.waitForVisible('[role="dialog"]')) {
            browser.click(letsGoButton);
            browser.waitForVisible('[role="dialog"]', constants.wait.long, true)
        }
    
        browser.waitForVisible('[data-qa-add-new-menu-button]', constants.wait.long);
    
        // TODO fix storeToken implementation
        //if (shouldStoreToken) {
        //    this.storeToken(username);
        //}
    }


    /*
        not currently working

        localStorage is a global var that's only available in the context of web driver.

        this would replace personal access tokens provided via env vars in favor of the access token
        created when logging in.
        
        we can rework token handling in a followup feature branch.
     */
    getTokenFromLocalStorage() {
        const browserLocalStorage = browser.execute(function() {
            return JSON.stringify(localStorage); // where does localStorage come from?
        });
        const parsedLocalStorage = JSON.parse(browserLocalStorage.value);
        return parsedLocalStorage['authentication/oauth-token'];
    }

}
module.exports = CredStore;