describe('Dashboard Smoke Suite', () => {
    it('should go to the dashboard', () => {
        expect(browser.isVisible('.App-appFrame-1')).toBe(true);
    });
});
