import { TableCell, TableRow, useTheme } from '@mui/material';
import * as React from 'react';

import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { MIN_PAGE_SIZE } from 'src/components/PaginationFooter/PaginationFooter.constants';
import {
  StyledTagHeader,
  StyledTagHeaderRow,
} from 'src/features/Linodes/LinodesLanding/DisplayLinodes.styles';

import { AlertTableRow } from './AlertTableRow';

import type { Item } from '../constants';
import type { Alert } from '@linode/api-v4';
import type { AlertServiceType } from '@linode/api-v4';

interface GroupedAlertsProps {
  /**
   * Array of tuples containing a tag string and its associated alerts
   */
  groupedAlerts: [string, Alert[]][];
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
  handleEnableDisable: (alert: Alert) => void;
  /**
   * The list of services to display in the table
   */
  services: Item<string, AlertServiceType>[];
}

export const AlertsGroupedByTag = ({
  groupedAlerts,
  handleDetails,
  handleEdit,
  handleEnableDisable,
  services,
}: GroupedAlertsProps) => {
  const theme = useTheme();
  // Create a Map to store refs for each tag
  const tagRefs = React.useRef<
    Map<string, React.RefObject<HTMLTableRowElement>>
  >(new Map(groupedAlerts.map(([tag]) => [tag, React.createRef()])));

  return (
    <React.Fragment>
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
              <React.Fragment>
                <StyledTagHeaderRow sx={{ backgroundColor: theme.bg.app }}>
                  <TableCell colSpan={6}>
                    <StyledTagHeader ref={tagRef} variant="h2">
                      {tag}
                    </StyledTagHeader>
                  </TableCell>
                </StyledTagHeaderRow>
                {paginatedTagAlerts.map((alert: Alert) => (
                  <AlertTableRow
                    handlers={{
                      handleDetails: () => handleDetails(alert),
                      handleEdit: () => handleEdit(alert),
                      handleEnableDisable: () => handleEnableDisable(alert),
                    }}
                    alert={alert}
                    key={alert.id}
                    services={services}
                  />
                ))}
                {count > MIN_PAGE_SIZE && (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ padding: 0 }}>
                      <PaginationFooter
                        handlePageChange={(newPage) => {
                          handleTagPageChange(newPage);
                          // Ensure consistent scroll behavior with a small delay
                          setTimeout(() => {
                            tagRef?.current?.scrollIntoView({
                              behavior: 'smooth',
                            });
                          }, 100);
                        }}
                        sx={{
                          border: 0,
                          marginBottom: theme.spacing(2),
                          marginTop: theme.spacing(2),
                        }}
                        count={count}
                        eventCategory={`Alert Definitions Table ${tag}`}
                        handleSizeChange={handleTagPageSizeChange}
                        page={page}
                        pageSize={pageSize}
                      />
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            )}
          </Paginate>
        );
      })}
    </React.Fragment>
  );
};
