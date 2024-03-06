# Feature Flags

Feature flags are useful when we want to ship code to production without actually making it visible to users. This lets us:

- Enable and disable a feature (e.g. an announcement banner) on a specific date.
- Enable a feature in the beta environment but not production.
- Enable a feature for a subset of users.
- Roll out a feature slowly.

Feature flags are served by [LaunchDarkly](https://launchdarkly.com/). On app load, a connection to LaunchDarkly is established via websocket, and flags are served to the app in the form of JSON.

Feature flag values themselves can be booleans (most common), strings, numbers, or JSON (also common).

We often need to control more than one setting for a given feature. For instance, a feature might have a boolean flag to enable/disable it, and a secondary flag to control its "beta" status. In LaunchDarkly, if using a JSON object and still wanting to control the on/off status of a feature, **all variations must contain an `enabled` key**. ex:

```json
{
  "enabled": true,
  "beta": true
}
```

Feature flags variations should also be labelled as clearly as possible to avoid confusion for a potential third party managing the flag you created.
For instance, for the example above, the variations could be labelled:

- Variation 1: Feature ON, Beta ON
- Variation 2: Feature ON, Beta OFF
- Variation 3: Everything OFF

## Creating a feature flag

Feature flags are created in the LaunchDarkly dashboard. Give your flag a name (like "Images Pricing Banner") and key (like "imagesPricingBanner") and select the flag type (boolean, etc). Configure the desired variations and targeting options.

Finally, in the Cloud Manager code, add your new flag type to the `Flags` interface in `packages/manager/src/featureFlags.ts`:

```ts
export interface Flags {
  // ... other feature flags
  imagesPricingBanner: boolean;
}
```

## Consuming a feature flag

To consume a feature flag from a function component, use the `useFlags` hook:

```tsx
import * as React from "react";
import { useFlags } from "src/hooks/useFlags";

const ImagesPricingBanner = () => {
  const flags = useFlags();

  if (flags.imagesPricingBanner) {
    return <PricingBanner />;
  }

  return null;
};
```

For (older) class components, use the `withFeatureFlagConsumer` HOC:

```tsx
import * as React from "react";
import withFeatureFlags, {
  FeatureFlagConsumerProps,
} from "src/containers/withFeatureFlagConsumer.container";

class ImagesPricingBanner extends React.Component<
  FeatureFlagConsumerProps,
  {}
> {
  render() {
    if (this.props.flags.imagesPricingBanner) {
      return <PricingBanner />;
    }

    return null;
  }
}
```

## How this works

Cloud Manager uses the official LaunchDarkly [React SDK](https://docs.launchdarkly.com/sdk/client-side/react). The LaunchDarkly ID is given as an env variable, `REACT_APP_LAUNCH_DARKLY_ID`.

The SDK uses React Context to provide and consume flags. Our main `App.tsx` component is wrapped in the `featureFlagProvider` higher-order-component (HOC), which is either:

- a re-export of the SDK's `withLDProvider` HOC (if the env variable is defined)
- an empty wrapper (if the env variable is _not_ defined)

This allows you to run the app without feature flags if you wish.

The LaunchDarkly Since the top-level `App.tsx` component is wrapped in the flag provider, any downstream components can consume feature flags using the `useFlags` hook or the `withFeatureFlagConsumer` HOC.
