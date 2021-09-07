import * as React from 'react';
import Button from 'src/components/Button';
import Box from 'src/components/core/Box';
import Typography from 'src/components/core/Typography';
import { useDismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import Notice from 'src/components/Notice';
import { complianceUpdateContext } from 'src/context/complianceUpdateContext';
import useNotifications from 'src/hooks/useNotifications';

const ComplianceBanner: React.FC<{}> = () => {
  const context = React.useContext(complianceUpdateContext);
  const notifications = useNotifications();

  const hasComplianceNotification =
    notifications.filter((thisNotification) => {
      return thisNotification.message.match(/eu-model/gi);
    }).length > 0;

  const { hasDismissedBanner, handleDismiss } = useDismissibleBanner(
    'gdpr-compliance'
  );

  if (!hasComplianceNotification || hasDismissedBanner) {
    return null;
  }

  return (
    <Notice important warning dismissible onClose={handleDismiss}>
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography>
          Please review the compliance update for guidance regarding the EU
          Standard Contractual Clauses and its application to user deployments
          in Linode’s London and Frankfurt data centers.
        </Typography>
        <Button
          buttonType="primary"
          style={{ marginLeft: 12, minWidth: 150 }}
          onClick={() => context.open()}
        >
          Review Update
        </Button>
      </Box>
    </Notice>
  );
};

export default ComplianceBanner;
