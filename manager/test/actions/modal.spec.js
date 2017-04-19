import { expect } from 'chai';
import {
  SHOW_MODAL,
  HIDE_MODAL,
  showModal,
  hideModal,
} from '~/actions/modal';

describe('actions/modal', () => {
  const title = 'title';
  const body = 'body';

  it('should return show modal action', () => {
    const f = showModal(title, body);

    expect(f.type).to.equal(SHOW_MODAL);
    expect(f.title).to.equal(title);
    expect(f.body).to.equal(body);
  });

  it('should return hide modal action', () => {
    const f = hideModal();

    expect(f.type).to.equal(HIDE_MODAL);
  });
});
