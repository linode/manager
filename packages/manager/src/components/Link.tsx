import * as React from 'react';
import { Link as RouterLink, LinkProps } from 'react-router-dom';

const isExternal = (href: string) => {
  return href.match(/http/);
};

export const Link: React.FC<LinkProps> = props => {
  const isLinkExternal = isExternal(props.to as string);
  return isLinkExternal ? (
    <a
      href={props.to as string}
      target="_blank"
      aria-describedby="new-window"
      rel="noopener noreferrer"
      onClick={props.onClick}
      className={props.className}
    >
      {props.children}
    </a>
  ) : (
    <RouterLink {...props} />
  );
};

export default Link;
