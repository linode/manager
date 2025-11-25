import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { networkLoadBalancerListenerFactory } from 'src/factories/networkLoadBalancer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { PortsDisplay } from './PortsDisplay';

describe('PortsDisplay', () => {
  it('renders None when there are no ports', () => {
    const { getByText } = renderWithTheme(<PortsDisplay ports={[]} />);

    expect(getByText('None')).toBeInTheDocument();
  });

  it('renders all ports when within the display limit', () => {
    const listeners = [
      networkLoadBalancerListenerFactory.build({ port: 80 }),
      networkLoadBalancerListenerFactory.build({ port: 443 }),
    ];

    const ports = listeners.map((l) => String(l.port));

    const { getByText, container } = renderWithTheme(
      <PortsDisplay ports={ports} />
    );

    // Both ports should be visible; match specifically a span to avoid duplicate matches
    expect(
      getByText((_, node) => {
        if (!node) return false;
        return (
          node.nodeName === 'SPAN' &&
          !!node.textContent &&
          node.textContent.includes(String(ports[0]))
        );
      })
    ).toBeInTheDocument();
    expect(
      getByText((_, node) => {
        if (!node) return false;
        return (
          node.nodeName === 'SPAN' &&
          !!node.textContent &&
          node.textContent.includes(String(ports[1]))
        );
      })
    ).toBeInTheDocument();

    // There should be no overflow badge like +N
    expect(container.textContent).not.toMatch(/\+\d+/);
  });

  it('truncates ports and shows overflow badge when exceeding limit', async () => {
    const listeners = [
      networkLoadBalancerListenerFactory.build({ port: 80 }),
      networkLoadBalancerListenerFactory.build({ port: 443 }),
      networkLoadBalancerListenerFactory.build({ port: 8080 }),
      networkLoadBalancerListenerFactory.build({ port: 53 }),
    ];

    const ports = listeners.map((l) => String(l.port));

    const { getByText, getByRole, container } = renderWithTheme(
      <PortsDisplay ports={ports} />
    );

    // First ports should be visible (match spans)
    expect(
      getByText((_, node) => {
        if (!node) return false;
        return (
          node.nodeName === 'SPAN' &&
          !!node.textContent &&
          node.textContent.includes(String(ports[0]))
        );
      })
    ).toBeInTheDocument();
    expect(
      getByText((_, node) => {
        if (!node) return false;
        return (
          node.nodeName === 'SPAN' &&
          !!node.textContent &&
          node.textContent.includes(String(ports[1]))
        );
      })
    ).toBeInTheDocument();

    // Overflow badge should be present (e.g. +2)
    const match = container.textContent?.match(/\+(\d+)/);
    expect(match).toBeTruthy();
    const hiddenCount = Number(match?.[1]);
    expect(hiddenCount).toBeGreaterThan(0);

    // Open the ShowMore popover by clicking the chip button using its aria-label
    const badgeText = `+${hiddenCount}`;
    const badgeButton = getByRole('button', { name: `${badgeText} ports` });

    fireEvent.click(badgeButton);

    // Hidden ports should now be visible in the popover; match spans
    const hiddenPorts = ports.slice(2);
    hiddenPorts.forEach((p) => {
      expect(
        getByText((_, node) => {
          if (!node) return false;
          return (
            node.nodeName === 'SPAN' &&
            !!node.textContent &&
            node.textContent.includes(p)
          );
        })
      ).toBeInTheDocument();
    });
  });
});
