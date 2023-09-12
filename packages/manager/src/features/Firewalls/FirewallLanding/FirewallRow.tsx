/* eslint-disable react-hooks/exhaustive-deps */
import { Firewall, FirewallDevice } from '@linode/api-v4/lib/firewalls';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { Hidden } from 'src/components/Hidden';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { useAllFirewallDevicesQuery } from 'src/queries/firewalls';
import { capitalize } from 'src/utilities/capitalize';

import { ActionHandlers, FirewallActionMenu } from './FirewallActionMenu';
import { StyledFirewallLink } from './FirewallRow.styles';

type CombinedProps = Firewall & ActionHandlers;

export const FirewallRow = React.memo((props: CombinedProps) => {
  const cellRef = React.useRef<HTMLTableCellElement | null>(null);

  const { id, label, rules, status, ...actionHandlers } = props;

  const { data: devices, error, isLoading } = useAllFirewallDevicesQuery(id);

  const count = getCountOfRules(rules);

  return (
    <TableRow
      ariaLabel={`Firewall ${label}`}
      data-testid={`firewall-row-${id}`}
    >
      <TableCell>
        <StyledFirewallLink tabIndex={0} to={`/firewalls/${id}`}>
          {label}
        </StyledFirewallLink>
      </TableCell>
      <TableCell statusCell>
        <StatusIcon status={status === 'enabled' ? 'active' : 'inactive'} />
        {capitalize(status)}
      </TableCell>
      <Hidden smDown>
        <TableCell>{getRuleString(count)}</TableCell>
        <TableCell>
          <div ref={cellRef}>
            {getLinodesCellString(devices ?? [], isLoading, error ?? undefined)}
          </div>
        </TableCell>
      </Hidden>
      <TableCell actionCell>
        <FirewallActionMenu
          firewallID={id}
          firewallLabel={label}
          firewallStatus={status}
          {...actionHandlers}
        />
      </TableCell>
    </TableRow>
  );
});

/**
 *
 * outputs either
 *
 * 1 Inbound / 2 Outbound
 *
 * 1 Inbound
 *
 * 3 Outbound
 */
export const getRuleString = (count: [number, number]): string => {
  const [inbound, outbound] = count;

  let string = '';

  if (inbound !== 0 && outbound !== 0) {
    return `${inbound} Inbound / ${outbound} Outbound`;
  } else if (inbound !== 0) {
    string = `${inbound} Inbound`;
  } else if (outbound !== 0) {
    string += `${outbound} Outbound`;
  }
  return string || 'No rules';
};

export const getCountOfRules = (rules: Firewall['rules']): [number, number] => {
  return [(rules.inbound || []).length, (rules.outbound || []).length];
};

const getLinodesCellString = (
  data: FirewallDevice[],
  loading: boolean,
  error?: APIError[]
): JSX.Element | string => {
  if (loading) {
    return 'Loading...';
  }

  if (error) {
    return 'Error retrieving Linodes';
  }

  if (data.length === 0) {
    return 'None assigned';
  }

  return <DeviceTableCell data={data} />;
};

function useMeasure() {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [bounds, setBounds] = React.useState({ height: 0, width: 0 });

  React.useEffect(() => {
    if (ref.current) {
      const resizeObserver = new ResizeObserver(([entry]) =>
        setBounds(entry.contentRect)
      );
      resizeObserver.observe(ref.current);
      return () => resizeObserver.disconnect();
    }
    // Disabling the next line ESLint check because we want to ensure all code paths return a value for TypeScript
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return () => {};
  }, []);

  return { bounds, ref };
}

interface DeviceTableCellProps {
  data: FirewallDevice[];
}

export const DeviceTableCell = (props: DeviceTableCellProps) => {
  const { data } = props;
  const { bounds, ref } = useMeasure();

  const rowHeight = parseFloat(getComputedStyle(document.body).fontSize);
  const maxRows = 3;

  const [visibleCount, setVisibleCount] = React.useState<number>(data.length);

  // React.useEffect(() => {
  //   let frameId; // to store the requestAnimationFrame ID

  //   const handleResize = () => {
  //     console.log('');
  //     console.log('bounds.height: ', bounds.height);
  //     console.log('visibleCount: ', visibleCount);
  //     const currentNumberOfRows = Math.floor(bounds.height / rowHeight);
  //     console.log('currentNumberOfRows: ', currentNumberOfRows);

  //     if (currentNumberOfRows > maxRows) {
  //       setVisibleCount(prevCount => {
  //         // Update state using a function to ensure it's based on the accurate previous value
  //         return prevCount - 1;
  //       });
  //       // Schedule the next frame ONLY if the condition is met
  //       frameId = window.requestAnimationFrame(handleResize);
  //     }
  //   };

  //   // Trigger the initial animation frame
  //   frameId = window.requestAnimationFrame(handleResize);

  //   // Optional: cleanup to cancel the animation frame if needed
  //   return () => window.cancelAnimationFrame(frameId);
  // }, [bounds.height, bounds.width, rowHeight, maxRows]);

  React.useEffect(() => {
    let frameId: number; // to store the requestAnimationFrame ID

    const handleResize = () => {
      // console.log('');
      // console.log('bounds.height: ', bounds.height);
      // console.log('visibleCount: ', visibleCount);
      const currentNumberOfRows = Math.floor(bounds.height / rowHeight);
      // console.log('currentNumberOfRows: ', currentNumberOfRows);

      if (currentNumberOfRows > maxRows) {
        setVisibleCount((prevCount) => {
          return Math.max(prevCount - 1, 0);
        });
        // Schedule the next frame ONLY if the condition is met
        frameId = window.requestAnimationFrame(handleResize);
      } else if (currentNumberOfRows < maxRows && visibleCount < data.length) {
        setVisibleCount((prevCount) => {
          return Math.min(prevCount + 1, data.length);
        });
        // Schedule the next frame ONLY if the condition is met
        frameId = window.requestAnimationFrame(handleResize);
      }
    };

    // Trigger the initial animation frame
    frameId = window.requestAnimationFrame(handleResize);

    // Optional: cleanup to cancel the animation frame if needed
    return () => window.cancelAnimationFrame(frameId);
  }, [
    bounds.height,
    bounds.width,
    rowHeight,
    maxRows,
    visibleCount,
    data.length,
  ]);

  return (
    <div ref={ref}>
      {data.slice(0, visibleCount).map((device, idx) => (
        <React.Fragment key={device.id}>
          {idx > 0 && `, `}
          <Link
            className="link secondaryLink"
            data-testid="firewall-row-link"
            to={`/${device.entity.type}s/${device.entity.id}`}
          >
            {device.entity.label}
          </Link>
        </React.Fragment>
      ))}
      {data.length > visibleCount && (
        <span>
          {`, `}+{data.length - visibleCount}
        </span>
      )}
    </div>
  );
};
