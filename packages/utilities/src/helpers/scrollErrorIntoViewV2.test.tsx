import { waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { scrollErrorIntoViewV2 } from './scrollErrorIntoViewV2';

describe('scrollErrorIntoViewV2', () => {
  it('should scroll to the error element when it exists', async () => {
    window.HTMLElement.prototype.scrollIntoView = vi.fn();

    const errorElement = document.createElement('div');
    errorElement.classList.add('error-for-scroll');
    const formContainer = document.createElement('div');

    const formContainerRef = {
      current: formContainer,
    };

    scrollErrorIntoViewV2(formContainerRef);

    expect(errorElement.scrollIntoView).not.toHaveBeenCalled();

    formContainer.appendChild(errorElement);

    await waitFor(() => {
      expect(errorElement.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
    });
  });
});
