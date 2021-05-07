import * as React from 'react';
import Button from 'src/components/Button';

export default {
  component: Button,
  title: 'Button',
};

// const Template = (args) => <Button {...args}>Primary</Button>;

// export const Default = Template.bind({});
// Default.args = {
//   buttonType: 'primary',
// };

export const Default = () => (
  <>
    <Button buttonType="primary" data-qa-button="primary">
      Primary
    </Button>
    <Button buttonType="secondary" data-qa-button="secondary">
      Secondary
    </Button>
    <Button buttonType="secondary" outline data-qa-button="secondary">
      Secondary with outline
    </Button>
    <Button buttonType="cancel" data-qa-button="cancel">
      Cancel
    </Button>
    <Button buttonType="remove" data-qa-button="remove" />
  </>
);

// export const Disabled = () => (
//   <React.Fragment>
//     <Button disabled buttonType="primary" data-qa-button="primary">
//       Primary
//     </Button>
//     <Divider />
//     <Button disabled buttonType="secondary" data-qa-button="secondary">
//       Secondary
//     </Button>
//     <Divider />
//     <Button buttonType="secondary" outline data-qa-button="secondary">
//       Secondary with Outline
//     </Button>
//     <Divider />
//     <Button
//       disabled
//       destructive
//       buttonType="primary"
//       data-qa-button="destructive"
//     >
//       Destructive
//     </Button>
//     <Divider />
//     <Button disabled buttonType="cancel" data-qa-button="cancel">
//       Cancel
//     </Button>
//     <Divider />
//   </React.Fragment>
// );

// export const Loading = () => (
//   <React.Fragment>
//     <Button loading buttonType="primary" data-qa-button="primary">
//       Primary
//     </Button>
//     <Divider />
//     <Button loading buttonType="secondary" data-qa-button="secondary">
//       Secondary
//     </Button>
//     <Divider />
//     <Button loading buttonType="cancel" data-qa-button="cancel">
//       Cancel
//     </Button>
//     <Divider />
//   </React.Fragment>
// );

// export const LoadingWithText = () => {
//   return (
//     <React.Fragment>
//       <Button
//         loading
//         buttonType="primary"
//         data-qa-button="primary"
//         loadingText="Fetching Linodes..."
//       >
//         Primary
//       </Button>
//       <Divider />
//       <Button
//         loading
//         buttonType="secondary"
//         data-qa-button="secondary"
//         loadingText="Fetching Volumes..."
//       >
//         Secondary
//       </Button>
//       <Divider />
//       <Button
//         loading
//         buttonType="cancel"
//         data-qa-button="cancel"
//         loadingText="Fetching Domains..."
//       >
//         Cancel
//       </Button>
//       <Divider />
//       <Button
//         loading
//         buttonType="primary"
//         compact
//         data-qa-button="primary"
//         loadingText="Fetching Linodes..."
//       >
//         Primary Compact
//       </Button>
//       <Divider />
//       <Button
//         loading
//         compact
//         buttonType="secondary"
//         data-qa-button="secondary"
//         loadingText="Fetching Volumes..."
//       >
//         Secondary Compact
//       </Button>
//       <Divider />
//       <Button
//         loading
//         compact
//         buttonType="cancel"
//         data-qa-button="cancel"
//         loadingText="Fetching Domains..."
//       >
//         Cancel Compact
//       </Button>
//       <Divider />
//     </React.Fragment>
//   );
// };

// export const Destructive = () => (
//   <React.Fragment>
//     <Button
//       destructive
//       buttonType="primary"
//       data-qa-button="primary"
//       data-qa-btn-type="destructive"
//     >
//       Primary
//     </Button>
//     <Divider />
//     <Button
//       disabled
//       destructive
//       buttonType="secondary"
//       data-qa-button="secondary"
//     >
//       Secondary
//     </Button>
//     <Divider />
//   </React.Fragment>
// );

// export const LoadingDestructive = () => (
//   <React.Fragment>
//     <Button
//       loading
//       destructive
//       buttonType="primary"
//       data-qa-button="primary"
//       data-qa-btn-type="destructive"
//     >
//       Primary
//     </Button>
//     <Divider />
//     <Button
//       loading
//       destructive
//       buttonType="secondary"
//       data-qa-button="secondary"
//       data-qa-btn-type="destructive"
//     >
//       Secondary
//     </Button>
//     <Divider />
//   </React.Fragment>
// );
