import Page from './page';

class CheckoutSummary extends Page {
    get orderSummary() { return $('[data-qa-order-summary]'); }
    get costSummary() { return $('[data-qa-total-price]'); }
    get imageName() { return $('[data-qa-image-name]'); }
    get imageSummary() { return $('[data-qa-image-summary]'); }
    get imageDetail() { return $('[data-qa-image-details-summary]'); }
    get regionSummary() { return $('[data-qa-region-summary]'); }
    get typeSummary() { return $('[data-qa-type-summary]'); }
    get backupsSummary() { return $('[data-qa-backups-summary]'); }
    get deploy() { return $('[data-qa-deploy-linode]'); }
}
export default new CheckoutSummary();
