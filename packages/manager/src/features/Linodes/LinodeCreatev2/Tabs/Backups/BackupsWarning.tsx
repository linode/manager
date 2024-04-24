import React from 'react';

import { Notice } from 'src/components/Notice/Notice';

export const BackupsWarning = () => {
  return (
    <Notice variant="warning">
      <ul
        style={{
          lineHeight: 1.5,
          marginBottom: 4,
          marginLeft: -18,
          marginTop: 4,
        }}
      >
        <li>
          This newly created Linode will be created with the same password and
          SSH Keys (if any) as the original Linode.
        </li>
        <li>
          This Linode will need to be manually booted after it finishes
          provisioning.
        </li>
      </ul>
    </Notice>
  );
};
