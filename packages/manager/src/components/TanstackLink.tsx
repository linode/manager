import { LinkComponent } from '@tanstack/react-router';
import { createLink } from '@tanstack/react-router';
import * as React from 'react';

import { Button } from 'src/components/Button/Button';
import { omitProps } from 'src/utilities/omittedProps';

import type { ButtonProps, ButtonType } from 'src/components/Button/Button';

export interface TanstackLinkProps
  extends Omit<ButtonProps, 'buttonType' | 'href'> {
  linkType: 'link' | ButtonType;
  tooltipAnalyticsEvent?: (() => void) | undefined;
  tooltipText?: string;
}

const LinkComponent = React.forwardRef<HTMLButtonElement, TanstackLinkProps>(
  (props, ref) => {
    const _props = omitProps(props, ['linkType']);

    return <Button component="a" ref={ref} {..._props} />;
  }
);

const CreatedLinkComponent = createLink(LinkComponent);

export const TanstackLink: LinkComponent<typeof LinkComponent> = (props) => {
  return (
    <CreatedLinkComponent
      preload="intent"
      {...props}
      sx={(theme) => ({
        ...(props.linkType === 'link' && {
          '&:hover': {
            textDecoration: 'underline',
          },
          fontFamily: theme.font.normal,
          fontSize: '0.875rem',
          minWidth: 'initial',
          padding: 0,
        }),
      })}
    />
  );
};
