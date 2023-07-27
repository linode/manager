import copy from 'copy-to-clipboard';
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

export class IPAddress extends React.Component<IPAddressProps> {
  componentWillUnmount() {
    if (this.copiedTimeout !== null) {
      window.clearTimeout(this.copiedTimeout);
    }
  }

  render() {
    const { ips, showAll, showMore } = this.props;

    const formattedIPS = ips
      .map((ip) => ip.replace('/64', ''))
      .sort(sortIPAddress);

    return (
      <StyledRootDiv showAll={showAll}>
        {!showAll
          ? this.renderIP(formattedIPS[0])
          : formattedIPS.map((a, i) => {
              return this.renderIP(a, i);
            })}

        {formattedIPS.length > 1 && showMore && !showAll && (
          <ShowMore
            render={(ipsAsArray: string[]) => {
              return ipsAsArray.map((ip, idx) =>
                this.renderIP(ip.replace('/64', ''), idx)
              );
            }}
            ariaItemType="IP addresses"
            data-qa-ip-more
            items={tail(formattedIPS)}
          />
        )}
      </StyledRootDiv>
    );
  }

  clickIcon = (ip: string) => {
    this.setState({
      copied: true,
    });
    window.setTimeout(() => this.setState({ copied: false }), 1500);
    copy(ip);
  };

  copiedTimeout: null | number = null;

  handleMouseEnter = () => {
    this.setState({
      isIpTooltipHovered: true,
    });
  };

  handleMouseLeave = () => {
    this.setState({
      isIpTooltipHovered: false,
    });
  };

  renderCopyIcon = (ip: string) => {
    const { isHovered = false, showTooltipOnIpHover = false } = this.props;
    const { isIpTooltipHovered } = this.state;

    return (
      <StyledIpLinkDiv data-qa-copy-ip>
        <StyledCopyTooltip
          isHovered={isHovered}
          isIpHovered={isIpTooltipHovered}
          showTooltipOnIpHover={showTooltipOnIpHover}
          text={ip}
        />
      </StyledIpLinkDiv>
    );
  };

  renderIP = (ip: string, key?: number) => {
    const { showTooltipOnIpHover = false } = this.props;

    const handlers = showTooltipOnIpHover
      ? {
          onMouseEnter: this.handleMouseEnter,
          onMouseLeave: this.handleMouseLeave,
        }
      : undefined;

    return (
      <StyledRenderIPDiv
        {...handlers}
        key={`${key}-${ip}`}
        showTooltipOnIpHover={showTooltipOnIpHover}
      >
        <CopyTooltip copyableText data-qa-copy-ip-text text={ip} />
        {this.renderCopyIcon(ip)}
      </StyledRenderIPDiv>
    );
  };

  state = {
    copied: false,
    isIpTooltipHovered: false,
  };
}

export default IPAddress;
