import { fireEvent, screen, waitFor } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { TagCell } from './TagCell';

describe('TagCell Component', () => {
  const tags = ['tag1', 'tag2'];
  const updateTags = vi.fn(() => Promise.resolve());

  describe('Disabled States', () => {
    it('does not allow adding a new tag when disabled', async () => {
      const { getByTestId } = renderWithTheme(
        <TagCell disabled tags={tags} updateTags={updateTags} view="panel" />
      );
      const disabledButton = getByTestId('button');
      expect(disabledButton).toHaveAttribute('aria-disabled', 'true');
    });

    it('should display the tooltip if disabled and tooltipText is true', async () => {
      const { getByTestId } = renderWithTheme(
        <TagCell disabled tags={tags} updateTags={updateTags} view="panel" />
      );
      const disabledButton = getByTestId('button');
      expect(disabledButton).toBeInTheDocument();

      fireEvent.mouseOver(disabledButton);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      expect(
        screen.getByText(
          'You must be an unrestricted User in order to add or modify tags on Linodes.'
        )
      ).toBeVisible();
    });
  });
});
