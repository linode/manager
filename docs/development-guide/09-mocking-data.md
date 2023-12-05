---
parent: Development Guide
---

# Mocking Data

This guide covers various methods of mocking data while developing or testing Cloud Manager.

## Mocking APIv4

Often when developing a feature you'll need your account or resources to be in a specific state. In other words, you'll need to be receiving specific data from the API.

The best way to do this is to _mock the API_. This is made simple using **factories** and the **mock service worker**.

**Factories**
We use [factory.ts](https://www.npmjs.com/package/factory.ts) to generate mock data. With factory.ts you define a base "factory" for a given type, then use the factory to generate real TypeScript objects:

```ts
import * as Factory from "factory.ts";

// Create a Linode factory:
export const linodeFactory = Factory.Sync.makeFactory<Linode>({
  id: Factory.each((i) => i),
  label: Factory.each((i) => `linode-${i}`),
  region: "us-east",
  // ... all other "Linode" fields
});

// Using the factory:

// Create a Linode...
const linode = linodeFactory.build();
// { id: 0, label: 'linode-0', region: 'us-east', ... }

// Create another Linode (the ID auto-increments)...
const anotherLinode = linodeFactory.build();
// { id: 1, label: 'linode-1', region: 'us-east', ... }

// Specify a region...
const londonLinode = linodeFactory.build({ region: "eu-west" });
// { id: 2, label: 'linode-2', region: 'eu-west', ... }

// Create an array of Linodes in London:
const linodeList = linodeFactory.buildList(10, { region: "eu-west" });
// [{ id: 3, label: 'linode-3', region: 'eu-west' }, ...9 more ]
```

**Mock Service Worker**
The [Mock Service Worker](https://mswjs.io/) package intercepts requests at the network level and returns the response you define.

To enable the MSW, open the Local Dev Tools and check the "Mock Service Worker" checkbox. Request handlers are defined in `packages/manager/src/mocks/serverHandlers.ts`. Here's an example request handler:

```ts
// packages/manager/src/mocks/serverHandlers.ts

import { rest } from "msw";

const handlers = [
  rest.get("*/profile", (req, res, ctx) => {
    //
    const profile = profileFactory.build({ restricted: true });
    return res(ctx.json(profile));
  }),
  // ... other handlers
];
```

When the MSW is enabled, any GET request that matches `*/profile` will be intercepted, and the response will be the `profile` JSON object we gave to the `res()` function.

The great thing about this is that the application treats these as _real_ network requests and will behave as though this data is coming from the actual API.

Another advantage is that server handler code can easily be shared with code reviewers (either by checking it into source control or providing the diff).

## Mocking feature flags

Cloud Manager uses [LaunchDarkly](https://github.com/launchdarkly/react-client-sdk) for feature flag management.

To run Cloud Manager without feature flags enabled, either:

- Run the app without `REACT_APP_LAUNCH_DARKLY_ID` defined in `.env`, or:
- [Block network requests](https://developers.google.com/web/updates/2017/04/devtools-release-notes#block-requests) to `*launchdarkly*`.

To run Cloud Manager with _specific values_ assigned to feature flags:

1. Run Cloud Manager without feature flags using a method listed above.
2. Open `src/containers/withFeatureFlagProvider.container.ts`.
3. Supply an `options.bootstrap` map to `withLDProvider`.

**Example:**

```js
options: {
  bootstrap: {
    isFeatureEnabled: true; // <-- Mocked flags here.
  }
}
```

## Changing user preferences

Since [user preferences are tied to OAuth clients](https://developers.linode.com/api/v4/profile-preferences), to change Cloud Manager preferences you must grab the short-lived token from the app and use that to curl.

As a convenience, there is a preference editor in Cloud accessible by going to `/profile/settings?preferenceEditor=true`. It allows you to enter arbitrary JSON and submit it (validating that it's valid JSON first). This makes it easier to quickly edit preferences when developing features that depend on it.
