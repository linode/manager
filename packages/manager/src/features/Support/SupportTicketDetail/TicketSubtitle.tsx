// import { SupportTicket } from '@linode/api-v4/lib/support/types';
// import React from 'react';

// import { Box } from 'src/components/Box';
// import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';

// interface Props {
//   dateUpdated: SupportTicket['updated'];
//   entity: SupportTicket['entity'];
//   status: SupportTicket['status'];
// }

// const

// export const TicketSubtitle = (props: Props) => {
//   return (
//     <Box
//       sx={(theme) => ({
//         alignItems: 'center',
//         display: 'flex',
//         marginBottom: theme.spacing(1),
//       })}
//     >
//       <StatusIcon status={status === 'Closed' ? 'inactive' : 'active'} />{' '}
//       {status} | Last updated by {ticket.updated_by} at {dateUpdated} |
//       Regarding: {ticket.entity}
//     </Box>
//   );
// };
