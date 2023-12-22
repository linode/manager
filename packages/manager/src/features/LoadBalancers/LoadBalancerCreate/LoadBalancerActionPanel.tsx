import { FieldArray } from 'formik';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';

import { initialValues } from './LoadBalancerCreateFormWrapper';

export const LoadBalancerActionPanel = () => {
  const history = useHistory<{
    contactDrawerOpen?: boolean;
    focusEmail?: boolean;
  }>();
  return (
    <Box
      columnGap={1}
      display="flex"
      flexWrap="wrap"
      justifyContent="space-between"
      rowGap={3}
    >
      <FieldArray
        render={({ push }) => (
          <Button
            buttonType="outlined"
            onClick={() => push(initialValues.configurations![0])}
          >
            Add Another Configuration
          </Button>
        )}
        name="configurations"
      />
      <Button
        onClick={() => {
          history.push('/loadbalancers/create/summary');
        }}
        buttonType="primary"
        sx={{ marginLeft: 'auto' }}
        type="button"
      >
        Review Load Balancer
      </Button>
    </Box>
  );
};
