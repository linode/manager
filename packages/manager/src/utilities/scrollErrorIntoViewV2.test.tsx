import { scrollErrorIntoViewV2 } from './scrollErrorIntoViewV2';

import type { Mock } from 'vitest';

describe('scrollErrorIntoViewV2', () => {
  it('should scroll to the error element when it exists', () => {
    window.HTMLElement.prototype.scrollIntoView = vi.fn();

    const errorElement = document.createElement('div');
    errorElement.classList.add('error-for-scroll');
    const formContainer = document.createElement('div');
    formContainer.appendChild(errorElement);

    const formContainerRef = {
      current: formContainer,
    };

    const observeMock = vi.fn();
    const disconnectMock = vi.fn();
    const takeRecords = vi.fn();
    window.MutationObserver = vi.fn(() => ({
      disconnect: disconnectMock,
      observe: observeMock,
      takeRecords,
    }));

    scrollErrorIntoViewV2(formContainerRef);

    expect(observeMock).toHaveBeenCalledWith(formContainer, {
      attributes: true,
      childList: true,
      subtree: true,
    });

    const mutationCallback = (window.MutationObserver as Mock).mock.calls[0][0];
    mutationCallback([{ target: formContainer, type: 'childList' }]);

    expect(errorElement.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    });
    expect(disconnectMock).toHaveBeenCalled();
  });
});
