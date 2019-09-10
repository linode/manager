import Page from './page';

class CheckoutSummary extends Page {
    get orderSummary() { return $('[data-qa-order-summary]'); }
    get costSummary() { return $('[data-qa-total-price]'); }
    get imageDetail() { return $('[data-qa-image-details]'); }
    get regionSummary() { return $('[data-qa-region-summary]'); }
    get backupsSummary() { return $('[data-qa-backups-summary]'); }
    get deploy() { return $('[data-qa-deploy-linode]'); }

    subheaderDisplays(title) {
        return $(`[data-qa-subheading="${title}"]`).isDisplayed();
    }

    imageDetailDisplays(detail) {
      return $(`[data-qa-details="${detail}"]`).isDisplayed();
    }
}
export default new CheckoutSummary();
