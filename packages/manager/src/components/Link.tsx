import * as React from 'react';
import { Link as RouterLink, LinkProps } from 'react-router-dom';

const isExternal = (href: string) => {
  return href.match(/http/);
};

export const Link: React.FC<LinkProps> = props => {
  return isExternal(props.to as string) ? (
    <a
      href={props.to as string}
      target="_blank"
      onClick={props.onClick}
      className={props.className}
    >
      {props.children}
    </a>
  ) : (
    <RouterLink {...props} />
  );
};
