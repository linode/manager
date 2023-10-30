import { loadBalancerLabelValidation } from '@linode/validation';
import { useFormik } from 'formik';
import { useState } from 'react';

export function useLoadBalancerState() {
  const initialValues = {
    label: '',
  };

  const { errors, setFieldError, setFieldValue } = useFormik({
    initialValues,
    onSubmit: () => {
      // TODO:AGLB -  Handle form submission here if needed
    },
    validationSchema: loadBalancerLabelValidation,
  });

  const [loadBalancerLabelValue, setLoadBalancerLabelValue] = useState(
    initialValues.label
  );

  const loadBalancerRegions = [
    { country: 'us', id: 'us-iad', label: 'Washington, DC' },
    { country: 'us', id: 'us-lax', label: 'Los Angeles, CA' },
    { country: 'fr', id: 'fr-par', label: 'Paris, FR' },
    { country: 'jp', id: 'jp-osa', label: 'Osaka, JP' },
    { country: 'au', id: 'ap-southeast', label: 'Sydney, AU' },
  ];

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoadBalancerLabelValue(e.target.value);
    setFieldValue('label', e.target.value);
    if (errors['label']) {
      setFieldError('label', undefined);
    }
  };

  return {
    errors,
    handleLabelChange,
    loadBalancerLabelValue,
    loadBalancerRegions,
  };
}
