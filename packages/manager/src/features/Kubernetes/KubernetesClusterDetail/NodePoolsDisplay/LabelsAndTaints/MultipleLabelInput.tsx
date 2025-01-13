// import { Input, Stack, TextField } from '@linode/ui';
// import React, { useState } from 'react';

// import { LinkButton } from 'src/components/LinkButton';

// import type { Label } from '@linode/api-v4';

// interface Props {
//   labels: Label;
//   onChange: () => void;
//   onClick: () => void;
// }
// // TODO: implement this drawer with RHF -- see MultipleSubnetInput as example
// export const MultipleLabelInput = (props: Props) => {
//   const { labels, onChange, onClick } = props;

//   const handleLabelChange = (e) => {
//     const newLabels = labels;

//     onChange();
//   };

//   return (
//     <Stack>
//       {labels && Object.entries(labels).length > 0
//         ? Object.entries(labels).map((i) => {
//             return (
//               <TextField
//                 key={`textfield-label-${i}`}
//                 label="Label"
//                 onChange={handleLabelChange}
//               />
//             );
//           })
//         : null}
//       <LinkButton onClick={onClick}>Add Label</LinkButton>
//     </Stack>
//   );
// };
