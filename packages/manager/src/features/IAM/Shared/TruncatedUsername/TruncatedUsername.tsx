import { Tooltip } from '@akamai/cds-components/react';
import * as React from 'react';

import { truncateEnd } from '../truncate';

interface Props {
  /**
   * Optional viewport width (in px). When provided, truncation only kicks in
   * while the window is at or below this width. When omitted, truncation is
   * always applied to usernames longer than 32 characters.
   */
  maxWindowWidth?: number;
  /**
   * Optional Styles
   */
  style?: React.CSSProperties;
  tooltipStyle?: React.CSSProperties;
  /**
   * The username to truncate
   */
  username: string;
}

const useWindowWidth = () => {
  const [width, setWidth] = React.useState(() => window.innerWidth);

  React.useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return width;
};

/**
 * A TruncatedUsername component that has the following features
 * - Truncates usernames longer than 32 characters
 * - Shows full username in a tooltip on hover if it exceeds 32 characters
 * - Optionally only truncates when the window is narrower than `maxWindowWidth`
 *
 * Note: This component is reused across CM and is not IAM-specific.
 * It handles usernames longer than 32 characters by truncating them and showing a tooltip.
 * While regular usernames are limited to 32 characters by validation,
 * this is mainly used for delegate usernames that has format: {delegate-parentUsername-HASH}.
 */
export const TruncatedUsername = (props: Props) => {
  const { maxWindowWidth, style, tooltipStyle, username } = props;
  const windowWidth = useWindowWidth();
  const isTruncated =
    username.length > 32 && (!maxWindowWidth || windowWidth <= maxWindowWidth);

  return (
    <Tooltip
      disabled={!isTruncated}
      style={tooltipStyle}
      tooltipPlacement="bottom"
      tooltipText={username}
    >
      <p
        style={{
          marginTop: 0,
          marginBottom: 0,
          ...style,
        }}
      >
        {isTruncated ? truncateEnd(username, 32) : username}
      </p>
    </Tooltip>
  );
};
