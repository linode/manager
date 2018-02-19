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

    expect(f.type).toBe(SHOW_MODAL);
    expect(f.title).toBe(title);
    expect(f.body).toBe(body);
  });

  it('should return hide modal action', () => {
    const f = hideModal();

    expect(f.type).toBe(HIDE_MODAL);
  });
});
