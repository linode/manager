import * as React from 'react';
import Button from 'src/components/Button';
import Box from 'src/components/core/Box';
import Typography from 'src/components/core/Typography';
import DismissibleBanner from 'src/components/DismissibleBanner';
import { complianceUpdateContext } from 'src/context/complianceUpdateContext';
import useNotifications from 'src/hooks/useNotifications';
import { isEUModelContractNotification } from '../NotificationCenter/NotificationData/useFormattedNotifications';

const ComplianceBanner: React.FC<React.PropsWithChildren<{}>> = () => {
  const context = React.useContext(complianceUpdateContext);
  const notifications = useNotifications();

  const hasComplianceNotification = notifications.some((thisNotification) =>
    isEUModelContractNotification(thisNotification)
  );

  if (!hasComplianceNotification) {
    return null;
  }

  return (
    <DismissibleBanner important warning preferenceKey="gdpr-compliance">
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography>
          Please review the compliance update for guidance regarding the EU
          Standard Contractual Clauses and its application to users located in
          Europe as well as deployments in Linode’s London and Frankfurt data
          centers
        </Typography>
        <Button
          buttonType="primary"
          style={{ marginLeft: 12, minWidth: 150 }}
          onClick={() => context.open()}
        >
          Review Update
        </Button>
      </Box>
    </DismissibleBanner>
  );
};

export default ComplianceBanner;
