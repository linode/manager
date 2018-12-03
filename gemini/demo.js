gemini.suite('homepage', (suite) => {
    suite.setUrl('/')
        .before(function(actions, els) {
            actions.executeJS(function(window) {
                window.document.getElementById('username').value = 'prod-test-011';
                window.document.getElementById('password').value = 'S83oz1kawzR03LGe81nbcziHFFXxuJV6';
                window.document.querySelector('form').submit();
            });
            actions.waitForElementToShow('[class*="MuiDialog-paper"]', 10000);
        })
        .setCaptureElements('[class*="MuiDialog-paper"]')
        .capture('Welcome screen');
});