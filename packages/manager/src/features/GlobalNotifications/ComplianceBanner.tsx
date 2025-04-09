import { Box, Button, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import { complianceUpdateContext } from 'src/context/complianceUpdateContext';
import { useNotificationsQuery } from 'src/queries/account/notifications';

import { isEUModelContractNotification } from '../NotificationCenter/utils';

export const ComplianceBanner = () => {
  const context = React.useContext(complianceUpdateContext);
  const { data: notifications } = useNotificationsQuery();

  const hasComplianceNotification = notifications?.some((notification) =>
    isEUModelContractNotification(notification)
  );

  if (!hasComplianceNotification) {
    return null;
  }

  return (
    <DismissibleBanner
      actionButton={
        <StyledActionButton buttonType="primary" onClick={() => context.open()}>
          Review Update
        </StyledActionButton>
      }
      important
      preferenceKey="gdpr-compliance"
      variant="warning"
    >
      <Box
        alignItems="center"
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
      >
        <Typography>
          Please review the compliance update for guidance regarding the EU
          Standard Contractual Clauses and its application to users located in
          Europe as well as deployments in Linode&rsquo;s London and Frankfurt
          data centers
        </Typography>
      </Box>
    </DismissibleBanner>
  );
};

const StyledActionButton = styled(Button)({
  marginLeft: 12,
  minWidth: 150,
});
