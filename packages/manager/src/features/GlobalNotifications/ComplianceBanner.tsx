import { styled } from '@mui/system';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { DismissibleBanner } from 'src/components/DismissibleBanner';
import { Typography } from 'src/components/Typography';
import { complianceUpdateContext } from 'src/context/complianceUpdateContext';
import { useNotificationsQuery } from 'src/queries/accountNotifications';

import { isEUModelContractNotification } from '../NotificationCenter/NotificationData/useFormattedNotifications';

const ComplianceBanner = () => {
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

const StyledActionButton = styled(Button)(({}) => ({
  marginLeft: 12,
  minWidth: 150,
}));

export default ComplianceBanner;
