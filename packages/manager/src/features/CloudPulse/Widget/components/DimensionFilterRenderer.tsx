// import { yupResolver } from '@hookform/resolvers/yup';
// import { Box, Button, Stack, Typography } from '@linode/ui';
// import React from 'react';
// import {
//   FormProvider,
//   useFieldArray,
//   useForm,
//   useFormContext,
//   useWatch,
// } from 'react-hook-form';
// import type { FieldPathByValue } from 'react-hook-form';

// import { DimensionFilterField } from '../../Alerts/CreateAlert/Criteria/DimensionFilterField';
// import { CloudPulseWidget } from '../CloudPulseWidget';
// import { CloudPulseWidgetFilter } from './CloudPulseWidgetFilter';

// import type {
//   CreateAlertDefinitionForm,
//   DimensionFilterForm,
//   OnlyDimensionFilterForm,
// } from '../../Alerts/CreateAlert/types';
// import type { Dimension } from '@linode/api-v4';

// interface DimensionFilterProps {
//   /**
//    * boolean value to disable the Data Field in dimension filter
//    */
//   dataFieldDisabled: boolean;
//   /**
//    * dimension filter data for the selected metric
//    */
//   dimensionOptions: Dimension[];
// }
// export const DimensionFilters = (props: DimensionFilterProps) => {
//   const { dataFieldDisabled, dimensionOptions } = props;
//   const formMethods = useForm<OnlyDimensionFilterForm>({
//     defaultValues: {
//       dimension_filters: [],
//     },
//     mode: 'onBlur',
//   });
//   const {
//     control,
//     formState: { errors, isSubmitting, submitCount },
//     getValues,
//     handleSubmit,
//     setError,
//     setValue,
//   } = formMethods;

//   const { append, fields, remove } = useFieldArray({
//     control,
//     name: 'dimension_filters',
//   });

//   const dimensionFilterWatcher = useWatch({
//     control,
//     name: 'dimension_filters',
//   });
//   const formRef = React.useRef<HTMLFormElement>(null);
//   return (
//     <FormProvider {...formMethods}>
//       <form onSubmit={() => {console.log('submit')}} ref={formRef}>
//         <Box display="flex" flexDirection="column" gap={1}>
//           <Typography variant="h3">
//             Dimension Filter
//             <Typography component="span"> (optional)</Typography>
//           </Typography>

//           <Stack gap={1}>
//             {fields?.length > 0 &&
//               fields.map((field, index) => (
//                 <CloudPulseWidgetFilter
//                   dataFieldDisabled={dataFieldDisabled}
//                   dimensionOptions={dimensionOptions}
//                   key={field.id}
//                   name={`dimension_filters.${index}`}
//                   onFilterDelete={() => remove(index)}
//                 />
//               ))}
//           </Stack>
//           <Button
//             compactX
//             data-qa-buttons="true"
//             disabled={
//               dimensionFilterWatcher && dimensionFilterWatcher.length === 5
//             }
//             onClick={() =>
//               append({
//                 dimension_label: null,
//                 operator: null,
//                 value: null,
//               })
//             }
//             size="small"
//             sx={{ justifyContent: 'start', width: '160px' }}
//             tooltipText="You can add up to 5 dimension filters."
//           >
//             Add dimension filter
//           </Button>
//         </Box>
//       </form>
//     </FormProvider>
//   );
// };
