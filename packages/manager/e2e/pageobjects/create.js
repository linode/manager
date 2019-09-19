import Page from './page';

class Create extends Page {
  get menuButton() {
    return $('[data-qa-add-new-menu-button]');
  }
  get linodeMenuItem() {
    return $('[data-qa-add-new-menu="Linode"]');
  }
  get volumeMenuItem() {
    return $('[data-qa-add-new-menu="Volume"]');
  }
  get nodeBalancerMenuItem() {
    return $('[data-qa-add-new-menu="Volume"]');
  }
  get selectionCards() {
    return $$('[SelectionCard-heading-321]');
  }

  linode() {
    $('[data-qa-add-new-menu="Linode"]').waitForDisplayed();
    this.linodeMenuItem.click();
  }

  volume() {
    $('[data-qa-add-new-menu="Volume"]').waitForDisplayed();
    this.volumeMenuItem.click();
  }

  nodebalancer() {
    $('[data-qa-add-new-menu="NodeBalancer"]').waitForDisplayed();
    this.nodeBalancerMenuItem.click();
  }
}

export default new Create();
