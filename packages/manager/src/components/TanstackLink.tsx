import { Link } from '@tanstack/react-router';
import * as React from 'react';

import { Button } from 'src/components/Button/Button';

import type { LinkProps } from '@tanstack/react-router';
import type { ButtonProps } from 'src/components/Button/Button';

export interface TanstackLinkProps extends LinkProps {
  buttonType: NonNullable<ButtonProps['buttonType']>;
}

export const TanstackLink = ({
  buttonType,
  children,
  ...linkProps
}: TanstackLinkProps) => {
  return (
    <Link {...linkProps}>
      <Button buttonType={buttonType} component="span">
        {typeof children === 'function'
          ? children({ isActive: false, isTransitioning: false })
          : children}
      </Button>
    </Link>
  );
};
