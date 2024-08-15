import React from 'react';

import { useSecureVMNoticesEnabled } from 'src/hooks/useSecureVMNoticesEnabled';

export interface WithSecureVMNoticesEnabledProps {
  secureVMNoticesEnabled: boolean;
}

export const withSecureVMNoticesEnabled = <Props>(
  Component: React.ComponentType<Props & WithSecureVMNoticesEnabledProps>
) => {
  return (props: Props) => {
    const { secureVMNoticesEnabled } = useSecureVMNoticesEnabled();

    return React.createElement(Component, {
      ...props,
      secureVMNoticesEnabled,
    });
  };
};
