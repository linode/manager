import copy from 'copy-to-clipboard';
import { tail } from 'ramda';
import * as React from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { ShowMore } from 'src/components/ShowMore/ShowMore';
import { privateIPRegex } from 'src/utilities/ipUtils';
import {
  StyledIPLinkDiv,
  StyledRootDiv,
  StyledCopyTooltip,
  StyledRenderIPDiv,
} from './IPAddress.styles';

export interface IPAddressProps {
  ips: string[];
  showAll?: boolean;
  showCopyOnHover?: boolean;
  showMore?: boolean;
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
      <StyledRootDiv className={`${!showAll && 'dif'}`}>
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

  renderCopyIcon = (ip: string) => {
    const { showCopyOnHover } = this.props;

    return (
      <StyledIPLinkDiv data-qa-copy-ip>
        <StyledCopyTooltip
          sx={{ margin: 0 }}
          showCopyOnHover={showCopyOnHover}
          data-testid={`CopyTooltip`}
          className={`copy`}
          text={ip}
        />
      </StyledIPLinkDiv>
    );
  };

  renderIP = (ip: string, key?: number) => {
    return (
      <StyledRenderIPDiv key={key}>
        <CopyTooltip copyableText data-qa-copy-ip-text text={ip} />
        {this.renderCopyIcon(ip)}
      </StyledRenderIPDiv>
    );
  };

  state = {
    copied: false,
  };
}

export default IPAddress;
