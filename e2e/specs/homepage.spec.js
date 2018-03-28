describe('Dashboard Smoke Suite', () => {
    it('should go to the dashboard', () => {
        expect(browser.isVisible('.MuiButton-root-221')).toBe(true);
    });
});
