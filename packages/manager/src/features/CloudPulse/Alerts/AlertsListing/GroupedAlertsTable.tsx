import { TableBody, TableCell, TableRow, useTheme } from '@mui/material';
import * as React from 'react';

import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { MIN_PAGE_SIZE } from 'src/components/PaginationFooter/PaginationFooter.constants';
import {
  StyledTagHeader,
  StyledTagHeaderRow,
} from 'src/features/Linodes/LinodesLanding/DisplayLinodes.styles';

import { scrollToElement } from '../Utils/AlertResourceUtils';
import { AlertTableRow } from './AlertTableRow';

import type { Item } from '../constants';
import type { AlertServiceType } from '@linode/api-v4';
import type { Alert } from '@linode/api-v4';
import type { GroupedBy } from '@linode/utilities';

interface GroupedAlertsProps {
  /**
   * Array of tuples containing a tag string and its associated alerts
   */
  groupedAlerts: GroupedBy<Alert>;
  /**
   * Callback function to handle viewing alert details
   */
  handleDetails: (alert: Alert) => void;
  /**
   * Callback function to handle editing an alert
   */
  handleEdit: (alert: Alert) => void;
  /**
   *  Callback function to handle enabling or disabling an alert
   */
  handleStatusChange: (alert: Alert) => void;
  /**
   * The list of services to display in the table
   */
  services: Item<string, AlertServiceType>[];
}

export const GroupedAlertsTable = ({
  groupedAlerts,
  handleDetails,
  handleEdit,
  handleStatusChange,
  services,
}: GroupedAlertsProps) => {
  const theme = useTheme();
  // Create a Map to store refs for each tag
  const tagRefs = React.useRef<
    Map<string, React.RefObject<HTMLTableRowElement>>
  >(new Map(groupedAlerts.map(([tag]) => [tag, React.createRef()])));

  const scrollToTagWithAnimation = React.useCallback(
    (tag: string) => {
      requestAnimationFrame(() => {
        const ref = tagRefs.current.get(tag);
        if (ref?.current) {
          scrollToElement(ref.current);
        }
      });
    },
    [tagRefs]
  );

  return (
    <>
      {groupedAlerts.map(([tag, alertsForTag]) => {
        const tagRef = tagRefs.current.get(tag);

        return (
          <Paginate data={alertsForTag} key={tag}>
            {({
              count,
              data: paginatedTagAlerts,
              handlePageChange: handleTagPageChange,
              handlePageSizeChange: handleTagPageSizeChange,
              page,
              pageSize,
            }) => (
              <TableBody>
                <StyledTagHeaderRow sx={{ backgroundColor: theme.bg.app }}>
                  <TableCell colSpan={7}>
                    <StyledTagHeader ref={tagRef} variant="h2">
                      {tag}
                    </StyledTagHeader>
                  </TableCell>
                </StyledTagHeaderRow>
                {paginatedTagAlerts.map((alert) => (
                  <AlertTableRow
                    handlers={{
                      handleDetails: () => handleDetails(alert),
                      handleEdit: () => handleEdit(alert),
                      handleStatusChange: () => handleStatusChange(alert),
                    }}
                    alert={alert}
                    key={alert.id}
                    services={services}
                  />
                ))}
                {count > MIN_PAGE_SIZE && (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ padding: 0 }}>
                      <PaginationFooter
                        handlePageChange={(newPage) => {
                          handleTagPageChange(newPage);
                          scrollToTagWithAnimation(tag);
                        }}
                        handleSizeChange={(pageSize) => {
                          handleTagPageSizeChange(pageSize);
                          handleTagPageChange(1);
                          scrollToTagWithAnimation(tag);
                        }}
                        sx={{
                          border: 0,
                          marginBottom:
                            groupedAlerts[groupedAlerts.length - 1][0] === tag
                              ? 0
                              : theme.spacingFunction(16),
                          marginTop: theme.spacingFunction(16),
                        }}
                        count={count}
                        eventCategory={`Alert Definitions Table ${tag}`}
                        page={page}
                        pageSize={pageSize}
                      />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            )}
          </Paginate>
        );
      })}
    </>
  );
};
