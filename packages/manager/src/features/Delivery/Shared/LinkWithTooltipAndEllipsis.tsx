import { Tooltip } from '@linode/ui';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';

import { Link } from 'src/components/Link';

const StyledLink = styled(Link, { label: 'StyledLink' })(({ theme }) => ({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: 'inline-block',
  maxWidth: 350,
  [theme.breakpoints.down('lg')]: {
    maxWidth: 200,
  },
  [theme.breakpoints.down('sm')]: {
    maxWidth: 120,
  },
  whiteSpace: 'nowrap',
}));

interface EllipsisLinkWithTooltipProps {
  children: string;
  className?: string;
  pendoId?: string;
  style?: React.CSSProperties;
  to: string;
}

export const LinkWithTooltipAndEllipsis = (
  props: EllipsisLinkWithTooltipProps
) => {
  const { to, children, pendoId, className, style } = props;

  const linkRef = useRef<HTMLAnchorElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const linkElement = linkRef.current;
    if (linkElement) {
      setShowTooltip(linkElement.scrollWidth > linkElement.clientWidth);
    }
  }, [children]);

  return (
    <Tooltip disableHoverListener={!showTooltip} title={children}>
      <StyledLink
        className={className}
        pendoId={pendoId}
        ref={linkRef}
        style={style}
        to={to}
      >
        {children}
      </StyledLink>
    </Tooltip>
  );
};
