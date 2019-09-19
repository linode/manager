const { constants } = require('../constants');

import Page from './page';
import { assertLog } from '../utils/assertionLog';

export class Dashboard extends Page {
  get header() {
    return $('[data-qa-dashboard-header]');
  }

  get linodesCard() {
    return $('[data-qa-card="Linodes"]');
  }
  get linodes() {
    return $('[data-qa-linode]');
  }
  get linodePlan() {
    return $('[data-qa-linode-plan]');
  }
  get linodeRegion() {
    return $('[data-qa-linode-region]');
  }

  get volumesCard() {
    return $('[data-qa-card="Volumes"]');
  }
  get volumes() {
    return $$('[data-qa-volume]');
  }
  get volumeRegion() {
    return $('[data-qa-volume-region]');
  }
  get volumeStatus() {
    return $('[data-qa-volume-status]');
  }

  get nodebalancerCard() {
    return $('[data-qa-card="NodeBalancers"]');
  }
  get nodebalancers() {
    return $$('[data-qa-node]');
  }
  get nodeHostname() {
    return $('[data-qa-node-hostname]');
  }
  get nodeRegion() {
    return $('[data-qa-node-region]');
  }

  get domainsCard() {
    return $('[data-qa-card="Domains"]');
  }
  get domains() {
    return $('[data-qa-domain]');
  }
  get domainName() {
    return $('[data-qa-domain-name]');
  }
  get domainStatus() {
    return $('[data-qa-domain-status]');
  }

  get monthlyTransferCard() {
    return $('[data-qa-card="Monthly Transfer"]');
  }
  get monthlyTransferUsed() {
    return $('[data-qa-transfer-used]');
  }
  get monthlyTransferQuota() {
    return $('[data-qa-transfer-quota]');
  }

  get blogCard() {
    return $('[data-qa-card="Blog"]');
  }
  get blogPosts() {
    return $$('[data-qa-blog-post]');
  }
  get postDescription() {
    return $('[data-qa-post-desc]');
  }

  get readMore() {
    return $$(`${this.blogCard.selector} a`).find(
      it => it.getText() === 'Read More'
    );
  }
  get autoBackupEnrollmentCTA() {
    return $('[data-qa-account-link]');
  }
  get backupExistingLinodes() {
    return $(this.enableAllBackups.selector);
  }
  get backupExistingMessage() {
    return $('[data-qa-linodes-message]');
  }
  get importGroupsAsTagsCta() {
    return $('[data-qa-group-cta-body]');
  }
  get dismissGroupCTA() {
    return $('[data-qa-dismiss-cta]');
  }

  baseElemsDisplay() {
    this.header.waitForDisplayed(constants.wait.normal);

    expect(this.linodesCard.isDisplayed())
      .withContext(
        `"${this.linodesCard.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.volumesCard.isDisplayed())
      .withContext(
        `"${this.volumesCard.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.nodebalancerCard.isDisplayed())
      .withContext(
        `"${this.nodebalancerCard.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.domainsCard.isDisplayed())
      .withContext(
        `"${this.domainsCard.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    this.blogCard.waitForDisplayed(constants.wait.normal);
    expect(this.blogCard.isDisplayed())
      .withContext(
        `"${this.blogCard.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.readMore.isDisplayed())
      .withContext(
        `"${this.readMore.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
  }

  entityCount(entity) {
    const countAttribute = 'data-qa-entity-count';
    return $(`[data-qa-card="${entity}"] [${countAttribute}]`).getAttribute(
      countAttribute
    );
  }

  viewAllLink(entity) {
    return $(`[data-qa-card="${entity}"] [data-qa-view-all-link]`);
  }
}

export default new Dashboard();
