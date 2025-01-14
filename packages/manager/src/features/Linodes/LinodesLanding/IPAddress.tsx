import * as React from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { ShowMore } from 'src/components/ShowMore/ShowMore';
import { PublicIPAddressesTooltip } from 'src/features/Linodes/PublicIPAddressesTooltip';
import { usePreferences } from 'src/queries/profile/preferences';
import { isPrivateIP } from 'src/utilities/ipUtils';
import { tail } from 'src/utilities/tail';

import {
  StyledCopyTooltip,
  StyledIpLinkDiv,
  StyledRenderIPDiv,
  StyledRootDiv,
} from './IPAddress.styles';

export interface IPAddressProps {
  /**
   * If true, the copy button will be disabled with a tooltip explanation.
   * @default false
   */
  disabled?: boolean;
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
  (isPrivateIP(ip1) ? 1 : -1) - (isPrivateIP(ip2) ? 1 : -1);

export const IPAddress = (props: IPAddressProps) => {
  const {
    disabled = false,
    ips,
    isHovered = false,
    showAll,
    showMore,
    showTooltipOnIpHover = false,
  } = props;

  const formattedIPS = ips
    .map((ip) => ip.replace('/64', ''))
    .sort(sortIPAddress);

  const copiedTimeout: null | number = null;

  const [isIpTooltipHovered, setIsIpTooltipHovered] = React.useState<boolean>(
    false
  );

  const { data: maskSensitiveDataPreference } = usePreferences(
    (preferences) => preferences?.maskSensitiveData
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
    if (disabled) {
      return PublicIPAddressesTooltip;
    }

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

  const renderIP = (ip: string) => {
    const handlers = showTooltipOnIpHover
      ? {
          onMouseEnter: handleMouseEnter,
          onMouseLeave: handleMouseLeave,
        }
      : undefined;

    return (
      <StyledRenderIPDiv
        {...handlers}
        showTooltipOnIpHover={showTooltipOnIpHover}
      >
        <CopyTooltip
          copyableText
          data-qa-copy-ip-text
          disabled={disabled}
          masked={Boolean(maskSensitiveDataPreference)}
          maskedTextLength="ipv4"
          text={ip}
        />
        {renderCopyIcon(ip)}
      </StyledRenderIPDiv>
    );
  };

  return (
    <StyledRootDiv showAll={showAll}>
      {!showAll ? renderIP(formattedIPS[0]) : formattedIPS.map(renderIP)}
      {formattedIPS.length > 1 && showMore && !showAll && (
        <ShowMore
          ariaItemType="IP addresses"
          data-qa-ip-more
          items={tail(formattedIPS)}
          render={(ipsAsArray: string[]) => ipsAsArray.map(renderIP)}
        />
      )}
    </StyledRootDiv>
  );
};
