import { useFormikContext } from 'formik';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';

export const LoadBalancerActionPanel = () => {
  const { submitForm } = useFormikContext();
  return (
    <Box
      columnGap={1}
      display="flex"
      flexWrap="wrap"
      justifyContent="space-between"
      rowGap={3}
    >
      <Button buttonType="outlined">Add Another Configuration</Button>
      <Button
        buttonType="primary"
        onClick={submitForm}
        sx={{ marginLeft: 'auto' }}
        type="submit"
      >
        Review Load Balancer
      </Button>
    </Box>
  );
};
