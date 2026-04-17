import * as React from 'react';

export interface LandingHeaderProps {
  children: React.ReactNode;
  spacingBottom?: 0 | 4 | 16 | 24;
  spacingTop?: 0 | 4 | 16 | 24;
}

export const LandingHeader = ({
  children,
  spacingBottom = 24,
  spacingTop = 24,
}: LandingHeaderProps) => (
  <div
    data-qa-entity-header
    style={{
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: spacingBottom !== undefined ? `${spacingBottom}px` : 0,
      marginTop: spacingTop !== undefined ? `${spacingTop}px` : 0,
      width: '100%',
    }}
  >
    {children}
  </div>
);
