import { Spacing } from '@akamai/cds-tokens';
import * as React from 'react';

export interface LandingHeaderProps {
  children: React.ReactNode;
  spacingBottom?: (typeof Spacing)[keyof typeof Spacing];
  spacingTop?: (typeof Spacing)[keyof typeof Spacing];
}

export const LandingHeader = ({
  children,
  spacingBottom = Spacing.S4,
  spacingTop = Spacing.S0,
}: LandingHeaderProps) => (
  <div
    data-qa-entity-header
    style={{
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: spacingBottom,
      marginTop: spacingTop,
      width: '100%',
    }}
  >
    {children}
  </div>
);
