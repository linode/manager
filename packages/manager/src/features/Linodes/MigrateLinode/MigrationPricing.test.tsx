import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { MigrationPricing } from './MigrationPricing';

const backupPricesNull = {
  monthly: null,
  hourly: null,
};

const backupPricesZero = {
  monthly: 0,
  hourly: 0,
};

const backupPricesRegular = {
  hourly: 0.004,
  monthly: 2.5,
};

describe('MigrationPricing component', () => {
  describe('render condition', () => {
    it('does not render when prices are not specified', async () => {
      // Some combinations of props that should prevent component rendering.
      const propCombinations = [
        { backups: 'disabled' as const, hourly: undefined, monthly: 0 },
        { backups: backupPricesNull, hourly: null, monthly: 0.1 },
        { backups: backupPricesRegular, hourly: null, monthly: null },
        { backups: backupPricesZero, hourly: undefined, monthly: 1 },
        { backups: undefined, hourly: 0, monthly: 0 },
        { backups: undefined, hourly: 1, monthly: undefined },
        { backups: undefined, hourly: null, monthly: null },
      ];

      propCombinations.forEach((props) => {
        const { queryByTestId, unmount } = renderWithTheme(
          <MigrationPricing panelType="current" {...props} />
        );
        expect(queryByTestId('migration-pricing')).toBeNull();
        unmount();
      });
    });

    it('renders when prices are specified', async () => {
      const props = {
        backups: 'disabled' as const,
        hourly: 0.004,
        monthly: 2.5,
      };

      const { findByTestId } = renderWithTheme(
        <MigrationPricing panelType="current" {...props} />
      );
      expect(await findByTestId('migration-pricing')).not.toBeNull();
    });

    it('renders when $0 prices are specified', async () => {
      const props = {
        backups: 'disabled' as const,
        hourly: 0,
        monthly: 0,
      };

      const { findByTestId } = renderWithTheme(
        <MigrationPricing panelType="current" {...props} />
      );
      expect(await findByTestId('migration-pricing')).not.toBeNull();
    });
  });

  describe('price display', () => {
    it('displays prices', async () => {
      const props = {
        backups: 'disabled' as const,
        hourly: 0.004,
        monthly: 2.5,
      };

      const { findByText } = renderWithTheme(
        <MigrationPricing panelType="current" {...props} />
      );
      expect(await findByText('$0.004')).toBeVisible();
      expect(await findByText('$2.50')).toBeVisible();
    });

    it('displays $0 prices', async () => {
      const props = {
        backups: 'disabled' as const,
        hourly: 0,
        monthly: 0,
      };

      const { findByText } = renderWithTheme(
        <MigrationPricing panelType="current" {...props} />
      );
      expect(await findByText('$0.000')).toBeVisible();
      expect(await findByText('$0.00')).toBeVisible();
    });
  });

  describe('backup price display', () => {
    it('shows backup prices', async () => {
      const props = {
        backups: backupPricesRegular,
        hourly: 0.001,
        monthly: 1.5,
      };

      const { findByText } = renderWithTheme(
        <MigrationPricing panelType="current" {...props} />
      );
      expect(await findByText('| Backups', { exact: false })).toBeVisible();
      expect(await findByText('$2.50')).toBeVisible();
    });

    it('shows $0 backup prices', async () => {
      const props = {
        backups: backupPricesZero,
        hourly: 0.001,
        monthly: 1.5,
      };

      const { findByText } = renderWithTheme(
        <MigrationPricing panelType="current" {...props} />
      );
      expect(await findByText('| Backups', { exact: false })).toBeVisible();
      expect(await findByText('$0.00')).toBeVisible();
    });

    it('hides backup prices when backups are disabled', () => {
      const props = {
        backups: 'disabled' as const,
        hourly: 0.001,
        monthly: 1.5,
      };

      const { queryByText } = renderWithTheme(
        <MigrationPricing panelType="current" {...props} />
      );
      expect(queryByText('| Backups', { exact: false })).toBeNull();
    });

    it('hides backup prices when backups are undefined', () => {
      const props = {
        backups: undefined,
        hourly: 0.001,
        monthly: 1.5,
      };

      const { queryByText } = renderWithTheme(
        <MigrationPricing panelType="current" {...props} />
      );
      expect(queryByText('| Backups', { exact: false })).toBeNull();
    });

    it('hides backup prices when backup prices are null', () => {
      const props = {
        backups: backupPricesNull,
        hourly: 0.001,
        monthly: 1.5,
      };

      const { queryByText } = renderWithTheme(
        <MigrationPricing panelType="current" {...props} />
      );
      expect(queryByText('| Backups', { exact: false })).toBeNull();
    });
  });
});
