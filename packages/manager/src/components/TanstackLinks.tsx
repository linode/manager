import { Button } from '@linode/ui';
import { omitProps } from '@linode/ui';
import { LinkComponent } from '@tanstack/react-router';
import { createLink } from '@tanstack/react-router';
import * as React from 'react';

import { MenuItem } from 'src/components/MenuItem';

import type { ButtonProps, ButtonType } from '@linode/ui';
import type { LinkProps as TanStackLinkProps } from '@tanstack/react-router';

export interface TanstackLinkComponentProps
  extends Omit<ButtonProps, 'buttonType' | 'href'> {
  linkType: 'link' | ButtonType;
  tooltipAnalyticsEvent?: (() => void) | undefined;
  tooltipText?: string;
}

export interface TanStackLinkRoutingProps {
  linkType: TanstackLinkComponentProps['linkType'];
  params?: TanStackLinkProps['params'];
  preload?: TanStackLinkProps['preload'];
  search?: TanStackLinkProps['search'];
  to: TanStackLinkProps['to'];
}

const LinkComponent = React.forwardRef<
  HTMLButtonElement,
  TanstackLinkComponentProps
>((props, ref) => {
  const _props = omitProps(props, ['linkType']);

  return <Button component="a" ref={ref} {..._props} />;
});

const MenuItemLinkComponent = React.forwardRef<
  HTMLButtonElement,
  TanstackLinkComponentProps
>((props, ref) => {
  const _props = omitProps(props, ['linkType']);

  return <MenuItem component="a" ref={ref} {..._props} />;
});

const CreatedLinkComponent = createLink(LinkComponent);
const CreatedMenuItemLinkComponent = createLink(MenuItemLinkComponent);

/**
 * @deprecated
 * This is marked as deprecated to discourage usage until the migration is complete.
 * While not technically deprecated, these components should not be used anywhere in the app.
 * They will be replacing our Links eventually, but have only been introduced early to test their functionality.
 */
export const TanstackLink: LinkComponent<typeof LinkComponent> = (props) => {
  return (
    // @ts-expect-error need help from alban
    <CreatedLinkComponent
      {...props}
      sx={(theme) => ({
        ...(props.linkType === 'link' && {
          '&:hover': {
            textDecoration: 'underline',
          },
          font: theme.font.normal,
          fontSize: '0.875rem',
          minWidth: 'initial',
          padding: 0,
        }),
      })}
    />
  );
};

/**
 * @deprecated
 * This is marked as deprecated to discourage usage until the migration is complete.
 * While not technically deprecated, these components should not be used anywhere in the app.
 * They will be replacing our Links eventually, but have only been introduced early to test their functionality.
 */
export const TanstackMenuItemLink: LinkComponent<
  typeof MenuItemLinkComponent
> = (props) => {
  return <CreatedMenuItemLinkComponent {...props} />;
};
