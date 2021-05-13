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

export const Disabled = () => (
  <>
    <Button disabled buttonType="primary" data-qa-button="primary">
      Primary
    </Button>
    <Button disabled buttonType="secondary" data-qa-button="secondary">
      Secondary
    </Button>
    <Button disabled buttonType="secondary" outline data-qa-button="secondary">
      Secondary with Outline
    </Button>
    <Button
      disabled
      destructive
      buttonType="primary"
      data-qa-button="destructive"
    >
      Destructive
    </Button>
    <Button disabled buttonType="cancel" data-qa-button="cancel">
      Cancel
    </Button>
  </>
);

export const Loading = () => (
  <>
    <Button loading buttonType="primary" data-qa-button="primary">
      Primary
    </Button>
    <Button loading buttonType="secondary" data-qa-button="secondary">
      Secondary
    </Button>
    <Button loading buttonType="cancel" data-qa-button="cancel">
      Cancel
    </Button>
  </>
);

export const LoadingWithText = () => {
  return (
    <>
      <Button
        loading
        buttonType="primary"
        data-qa-button="primary"
        loadingText="Fetching Linodes..."
      >
        Primary
      </Button>
      <Button
        loading
        buttonType="secondary"
        data-qa-button="secondary"
        loadingText="Fetching Volumes..."
      >
        Secondary
      </Button>
      <Button
        loading
        buttonType="cancel"
        data-qa-button="cancel"
        loadingText="Fetching Domains..."
      >
        Cancel
      </Button>
      <Button
        loading
        buttonType="primary"
        compact
        data-qa-button="primary"
        loadingText="Fetching Linodes..."
      >
        Primary Compact
      </Button>
      <Button
        loading
        compact
        buttonType="secondary"
        data-qa-button="secondary"
        loadingText="Fetching Volumes..."
      >
        Secondary Compact
      </Button>
      <Button
        loading
        compact
        buttonType="cancel"
        data-qa-button="cancel"
        loadingText="Fetching Domains..."
      >
        Cancel Compact
      </Button>
    </>
  );
};

export const Destructive = () => (
  <>
    <Button
      destructive
      buttonType="primary"
      data-qa-button="primary"
      data-qa-btn-type="destructive"
    >
      Primary
    </Button>
    <Button
      disabled
      destructive
      buttonType="secondary"
      data-qa-button="secondary"
    >
      Secondary
    </Button>
  </>
);

export const LoadingDestructive = () => (
  <>
    <Button
      loading
      destructive
      buttonType="primary"
      data-qa-button="primary"
      data-qa-btn-type="destructive"
    >
      Primary
    </Button>
    <Button
      loading
      destructive
      buttonType="secondary"
      data-qa-button="secondary"
      data-qa-btn-type="destructive"
    >
      Secondary
    </Button>
  </>
);
