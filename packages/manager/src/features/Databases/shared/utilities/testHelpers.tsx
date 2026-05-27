import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

export const openActionMenu = async (menu: HTMLElement) => {
  await waitFor(() => {
    expect(menu.shadowRoot?.querySelector('cds-icon')).toBeTruthy();
  });

  const trigger = menu.shadowRoot?.querySelector('cds-icon');
  await userEvent.click(trigger as HTMLElement);
};
