import React from 'react';

export interface LinkProps {
  children: React.ReactNode;
  className?: string;
  to: string | undefined;
}

export const Link = (
  props: LinkProps & React.AnchorHTMLAttributes<HTMLAnchorElement>
) => {
  const { href, to, ...rest } = props;

  return <a href={to ?? href} {...rest} />;
};
