import { FieldArray, useFormikContext } from 'formik';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';

import { initialValues } from './LoadBalancerCreateFormWrapper';

import type { LoadBalancerCreateFormData } from './LoadBalancerCreateFormWrapper';

export const LoadBalancerActionPanel = () => {
  const history = useHistory<{
    contactDrawerOpen?: boolean;
    focusEmail?: boolean;
  }>();

  const {
    errors,
    validateForm,
  } = useFormikContext<LoadBalancerCreateFormData>();

  const handleButtonClick = async () => {
    const errors = await validateForm();
    if (Object.keys(errors).length === 0) {
      // No errors, proceed with the action
      history.push('/loadbalancers/create/summary');
    }
  };

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
        buttonType="primary"
        disabled={Object.keys(errors)?.length > 0}
        onClick={handleButtonClick}
        sx={{ marginLeft: 'auto' }}
        type="button"
      >
        Review Load Balancer
      </Button>
    </Box>
  );
};
