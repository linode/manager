import React, { useState } from 'react';

import { Code } from 'src/components/Code/Code';
import { Drawer } from 'src/components/Drawer';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { Link } from 'src/components/Link';
import { Radio } from 'src/components/Radio/Radio';
import { RadioGroup } from 'src/components/RadioGroup';
import { Typography } from 'src/components/Typography';

import { AddExistingCertificateForm } from './AddExistingCertificateForm';
import { AddNewCertificateForm } from './AddNewCertificateForm';

import type { CertificateConfig } from '@linode/api-v4';

export interface AddCertificateDrawerProps {
  loadbalancerId: number;
  onAdd: (certificates: CertificateConfig) => void;
  onClose: () => void;
  open: boolean;
}

type Mode = 'existing' | 'new';

export const AddCertificateDrawer = (props: AddCertificateDrawerProps) => {
  const { onClose, open } = props;

  const [mode, setMode] = useState<Mode>('new');

  return (
    <Drawer onClose={onClose} open={open} title="Add Certificate">
      {/* @TODO Add AGLB docs link - M3-7041 */}
      <Typography>
        Input the host header that the Load Balancer will repsond to and the
        respective certificate to deliver. Use <Code>*</Code> as a wildcard
        apply to any host. <Link to="#">Learn more.</Link>
      </Typography>
      <RadioGroup onChange={(_, value) => setMode(value as Mode)} value={mode}>
        <FormControlLabel
          control={<Radio />}
          label="Create New Certificate"
          value="new"
        />
        <FormControlLabel
          control={<Radio />}
          label="Add Existing Certificate"
          value="existing"
        />
      </RadioGroup>
      {mode === 'existing' ? (
        <AddExistingCertificateForm {...props} />
      ) : (
        <AddNewCertificateForm {...props} />
      )}
    </Drawer>
  );
};
