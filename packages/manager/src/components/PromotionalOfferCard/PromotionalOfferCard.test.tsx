import * as React from 'react';

import { promotionalOfferFactory } from 'src/factories/promotionalOffer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import {
  checkStringOrDefault,
  PromotionalOfferCard,
} from './PromotionalOfferCard';

const promo = promotionalOfferFactory.build();

describe('PromotionalOfferCard', () => {
  it('renders body and footnote', () => {
    const { getByText } = renderWithTheme(<PromotionalOfferCard {...promo} />);
    getByText(promo.body);
    getByText(promo.footnote);
  });

  it('renders each button', () => {
    const { getByText, queryByText } = renderWithTheme(
      <PromotionalOfferCard {...promo} />
    );
    promo.buttons.forEach((button) => {
      getByText(button.text);
      const anchor = queryByText(button.text)?.closest('a');
      expect(anchor).toHaveAttribute('href', button.href);
    });
  });

  it('does not include href if button URL is invalid', () => {
    const { queryByText } = renderWithTheme(
      <PromotionalOfferCard
        {...promo}
        buttons={[
          { href: 'javascript:alert(1)', text: 'Button Text', type: 'primary' },
        ]}
      />
    );
    const anchor = queryByText('Button Text')?.closest('a');
    // MUI Buttons without an `href` prop do not render an <a />.
    expect(anchor).toBeNull();
  });

  it("doesn't render buttons if in fullWidth mode", () => {
    const { queryByText } = renderWithTheme(
      <PromotionalOfferCard {...promo} fullWidth={true} />
    );
    promo.buttons?.forEach((button) => {
      expect(queryByText(button.text)).toBeNull();
    });
  });
});

describe('checkStringOrDefault', () => {
  it('returns the default if the argument is not a string', () => {
    expect(checkStringOrDefault(123)).toBe('');
    expect(checkStringOrDefault(true)).toBe('');
    expect(checkStringOrDefault(null)).toBe('');
    expect(checkStringOrDefault(undefined)).toBe('');
    expect(checkStringOrDefault({})).toBe('');
    expect(checkStringOrDefault([])).toBe('');
    expect(checkStringOrDefault(123, 'default')).toBe('default');
    expect(checkStringOrDefault('actually a string')).toBe('actually a string');
  });
});
