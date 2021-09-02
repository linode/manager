import * as React from 'react';

import DismissibleBanner from 'src/components/DismissibleBanner';
import Grid from 'src/components/core/Grid';
import Typography from 'src/components/core/Typography';
import Button from 'src/components/Button';
import ComplianceUpdateModal from './ComplianceUpdateModal';

const ComplianceBanner: React.FC<{}> = () => {
  const [dialogOpen, setDialogOpen] = React.useState(false);

  return (
    <>
      <DismissibleBanner preferenceKey="gdpr-compliance">
        <Grid
          container
          direction="row"
          alignItems="center"
          justify="space-between"
        >
          <Grid item xs={9}>
            <Typography>
              Please review the compliance update for guidance regarding the EU
              Standard Contractual Clauses and its application to user
              deployments in Linode’s London and Frankfurt data centers.
            </Typography>
          </Grid>
          <Grid
            item
            xs={3}
            style={{ display: 'flex', justifyContent: 'flex-end' }}
          >
            <Button buttonType="primary" onClick={() => setDialogOpen(true)}>
              Review Update
            </Button>
          </Grid>
        </Grid>
      </DismissibleBanner>
      <ComplianceUpdateModal
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
};

export default ComplianceBanner;
