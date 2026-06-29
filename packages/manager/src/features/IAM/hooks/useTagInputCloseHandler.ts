import * as React from 'react';

import type { TagInputElement } from '@akamai/cds-components';

/**
 * Private internals of TagInputElement that are not part of the public API.
 * Typed explicitly so we avoid a broad `any` cast in the workaround below.
 */
interface TagInputPrivateInternals {
  _closeDropdown: () => void;
  _hasFocus: boolean;
}

/**
 * Workaround for a CDS bug: when TagInput contains invalid (red) items,
 * clicking outside the component does not close the popover.
 *
 * Root causes (confirmed by reading the Lit source):
 *
 *  1. The host element is not directly focused — the <input> inside the shadow
 *     DOM is. Calling `node.blur()` on the host is therefore a no-op.
 *
 *  2. `node.contains()` does not pierce the shadow DOM, so shadow-DOM children
 *     (dropdown items, <cds-tag> chips) were mis-classified as "outside the
 *     component", causing the listener to fire even for clicks that should keep
 *     the dropdown open.
 *
 * Fix: use `e.composedPath()` (which does pierce shadow DOM boundaries) to
 * correctly distinguish inside vs. outside clicks; then blur the shadow root's
 * active element and call `_closeDropdown()` directly so the popover is closed
 * regardless of the Lit element's own focus/blur handling.
 *
 * TODO: CDS - remove once the Lit element correctly closes the popover on
 * outside click when invalid items are present.
 */
export const useTagInputCloseHandler = (
  tagInputNodeRef: React.RefObject<null | TagInputElement<string>>
) => {
  React.useEffect(() => {
    const handleOutsideMouseDown = (e: MouseEvent) => {
      const node = tagInputNodeRef.current;
      if (!node) return;
      if (e.composedPath().includes(node)) return;

      // Blur the actually-focused element inside the shadow DOM.
      const shadowActive = node.shadowRoot?.activeElement;
      if (shadowActive instanceof HTMLElement) {
        shadowActive.blur();
      }

      // Call private methods directly as a definitive fallback.
      (node as unknown as TagInputPrivateInternals)._closeDropdown?.();
      (node as unknown as TagInputPrivateInternals)._hasFocus = false;
    };

    document.addEventListener('mousedown', handleOutsideMouseDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideMouseDown);
    };
  }, [tagInputNodeRef]);
};
