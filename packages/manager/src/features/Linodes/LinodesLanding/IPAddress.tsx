import { tail } from 'ramda';
import * as React from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { ShowMore } from 'src/components/ShowMore/ShowMore';
import { privateIPRegex } from 'src/utilities/ipUtils';

import {
  StyledCopyTooltip,
  StyledIpLinkDiv,
  StyledRenderIPDiv,
  StyledRootDiv,
} from './IPAddress.styles';

type RenderIPData = {
  ip: string;
  key?: number;
};

export interface IPAddressProps {
  /**
   * Conditional handlers to be applied to the IP wrapper div when `showTooltipOnIpHover` is true.
   * @default undefined
   */
  handlers?: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  };
  /**
   * The IP addresses to be displayed.
   * default []
   */
  ips: string[];
  /**
   * If true, the IP address copy icon will be displayed when the row is hovered.
   * @default false
   */
  isHovered?: boolean;
  /**
   * If true, all IP addresses will be displayed.
   * @default false
   */
  showAll?: boolean;
  /**
   * If true, additional IP addresses will be displayed via a ShowMore component within a tooltip.
   * @default false
   */
  showMore?: boolean;
  /**
   * If true, the IP address copy icon will only be displayed when hovering over the IP address.
   * @default false
   */
  showTooltipOnIpHover?: boolean;
}

export const sortIPAddress = (ip1: string, ip2: string) =>
  (privateIPRegex.test(ip1) ? 1 : -1) - (privateIPRegex.test(ip2) ? 1 : -1);

export const IPAddress = (props: IPAddressProps) => {
  const {
    ips,
    showAll,
    showMore,
    isHovered = false,
    showTooltipOnIpHover = false,
  } = props;

  const formattedIPS = ips
    .map((ip) => ip.replace('/64', ''))
    .sort(sortIPAddress);

  const copiedTimeout: null | number = null;

  const [isIpTooltipHovered, setIsIpTooltipHovered] = React.useState<boolean>(
    false
  );

  React.useEffect(() => {
    return () => {
      if (copiedTimeout !== null) {
        window.clearTimeout(copiedTimeout);
      }
    };
  }, [copiedTimeout]);

  const handleMouseEnter = () => setIsIpTooltipHovered(true);
  const handleMouseLeave = () => setIsIpTooltipHovered(false);

  const renderCopyIcon = (ip: string) => {
    return (
      <StyledIpLinkDiv data-qa-copy-ip>
        <StyledCopyTooltip
          data-testid={`styled-copytooltip`}
          isHovered={isHovered}
          isIpHovered={isIpTooltipHovered}
          showTooltipOnIpHover={showTooltipOnIpHover}
          text={ip}
        />
      </StyledIpLinkDiv>
    );
  };

  const renderIP = ({ ip, key }: RenderIPData) => {
    const handlers = showTooltipOnIpHover
      ? {
          onMouseEnter: handleMouseEnter,
          onMouseLeave: handleMouseLeave,
        }
      : undefined;

    return (
      <StyledRenderIPDiv
        {...handlers}
        key={`${key}-${ip}`}
        showTooltipOnIpHover={showTooltipOnIpHover}
      >
        <CopyTooltip copyableText data-qa-copy-ip-text text={ip} />
        {renderCopyIcon(ip)}
      </StyledRenderIPDiv>
    );
  };

  return (
    <StyledRootDiv showAll={showAll}>
      {!showAll
        ? renderIP({ ip: formattedIPS[0] })
        : formattedIPS.map((a, i) => {
            return renderIP({ ip: a, key: i });
          })}

      {formattedIPS.length > 1 && showMore && !showAll && (
        <ShowMore
          render={(ipsAsArray: string[]) => {
            return ipsAsArray.map((ip, idx) =>
              renderIP({ ip: ip.replace('/64', ''), key: idx })
            );
          }}
          ariaItemType="IP addresses"
          data-qa-ip-more
          items={tail(formattedIPS)}
        />
      )}
    </StyledRootDiv>
  );
};
