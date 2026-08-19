import React from 'react';

export interface DividerProps {
  spacingBottom?: number | string;
  spacingTop?: number | string;
}

export const Divider = ({ spacingBottom, spacingTop }: DividerProps) => {
  return (
    <hr
      style={{
        display: 'block',
        margin: `var(--token-global-spacing-s8) 0`,
        width: '100%',
        borderWidth: '0 0 thin',
        borderStyle: 'solid',
        borderColor:
          'var(--token-component-divider-border, light-dark(#d6d6dd, #515157))',
        marginBottom: spacingBottom,
        marginTop: spacingTop,
      }}
    />
  );
};
