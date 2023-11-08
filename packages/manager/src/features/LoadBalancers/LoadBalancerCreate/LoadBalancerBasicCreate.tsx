import { CreateBasicLoadbalancerSchema } from '@linode/validation';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { DocumentTitleSegment } from 'src/components/DocumentTitle/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { Stack } from 'src/components/Stack';
import { TextField } from 'src/components/TextField';
import { useLoadBalancerBasicCreateMutation } from 'src/queries/aglb/loadbalancers';
import { getFormikErrorsFromAPIErrors } from 'src/utilities/formikErrorUtils';

import { LoadBalancerRegions } from './LoadBalancerRegions';

export const LoadBalancerBasicCreate = () => {
  const {
    error,
    mutateAsync: createLoadbalancer,
  } = useLoadBalancerBasicCreateMutation();

  const { push } = useHistory();
  const { enqueueSnackbar } = useSnackbar();

  const formik = useFormik({
    initialValues: {
      label: '',
    },
    async onSubmit(values, formikHelpers) {
      try {
        const loadbalancer = await createLoadbalancer(values);
        enqueueSnackbar(
          `Load Balancer ${loadbalancer.label} successfully created.`,
          { variant: 'success' }
        );
        push(`/loadbalancers/${loadbalancer.id}`);
      } catch (error) {
        formikHelpers.setErrors(getFormikErrorsFromAPIErrors(error));
      }
    },
    validationSchema: CreateBasicLoadbalancerSchema,
  });

  const generalError = error
    ?.filter((e) => !e.field || e.field !== 'label')
    .map((e) => e.reason)
    .join(', ');

  return (
    <form onSubmit={formik.handleSubmit}>
      <DocumentTitleSegment segment="Create a Load Balancer" />
      <LandingHeader
        breadcrumbProps={{
          crumbOverrides: [
            {
              label: 'Global Load Balancers',
              position: 1,
            },
          ],
          pathname: location.pathname,
        }}
        feedbackLink="https://docs.google.com/forms/d/e/1FAIpQLSdfetx9VvwjUAC_gdGQai_FpZN4xZ1GZGW54abezS2aV5rCcQ/viewform"
        feedbackLinkLabel="BETA Feedback"
        shouldHideDocsAndCreateButtons={true}
        title="Create"
      />
      <Stack spacing={3}>
        {generalError && <Notice text={generalError} variant="error" />}
        <Paper>
          <TextField
            errorText={formik.errors.label}
            label="Load Balancer Label"
            name="label"
            noMarginTop
            onChange={formik.handleChange}
            value={formik.values.label}
          />
        </Paper>
        <LoadBalancerRegions />
        <Box display="flex" justifyContent="flex-end">
          <Button
            buttonType="primary"
            loading={formik.isSubmitting}
            type="submit"
          >
            Create Load Balancer
          </Button>
        </Box>
      </Stack>
    </form>
  );
};
