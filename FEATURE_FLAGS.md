# Feature Flags

We use [LaunchDarkly](https://launchdarkly.com/) (React SDK) for feature flagging.

### To use feature flagging in a component:

1. Create the feature flag in LaunchDarkly. For this example we'll use a boolean flag called `demoFlag`.
2. In `featureFlags.ts` add your flag to the `FeatureFlag` type:

```typescript
type FeatureFlag = 'someFlag1' | 'someFlag2' | 'demoFlag';
```

3. Write a function to determine whether or not your flag is enabled.

```typescript
export const isDemoFlagEnabled = (flags: FlagSet): boolean => {
  return flags.demoFlag === true;
};
```

4. Add a new key to the `featureFlag` map:

```typescript
const featureFlags: Record<FeatureFlag, FlagUtilities> = {
  // ... other flags
  demoFlag: { isEnabled: isDemoFlagEnabled }
};
```

5. Finally, use the feature flag in your component. As a practice, tag it with a `@featureFlag` comment. You'll need to type `useFlags()` as `FlagSet`:

```typescript
import useFlags from 'src/hooks/useFlags';

const flags = useFlags() as FlagSet;

/** @featureFlag */
if (featureFlags.demoFlag.isEnabled(flags)) {
  // DO SOMETHING
}
```
