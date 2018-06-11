import Page from './page';

class CheckoutSummary extends Page {
    get orderSummary() { return $('[data-qa-order-summary]'); }
    get costSummary() { return $('[data-qa-total-price]'); }
    get imageDetail() { return $('[data-qa-image-details-summary]'); }
    get regionSummary() { return $('[data-qa-region-summary]'); }
    get backupsSummary() { return $('[data-qa-backups-summary]'); }
    get deploy() { return $('[data-qa-deploy-linode]'); }

    subheaderDisplays(title) {
        return browser.isVisible(`[data-qa-subheading="${title}"]`);
    }
}
export default new CheckoutSummary();
