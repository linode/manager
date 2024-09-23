# Mocking Data

This guide covers various methods of mocking data while developing or testing Cloud Manager.

## Mocking APIv4

Often when developing a feature you'll need your account or resources to be in a specific state. In other words, you'll need to be receiving specific data from the API.

The best way to do this is to _mock the API_. This is made simple using [**factories**](https://github.com/linode/manager/tree/develop/packages/manager/src/factories) and the [**mock service worker**](https://github.com/linode/manager/tree/develop/packages/manager/src/mocks) tooling suite.

### Factories
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

Because our factories are used by our dev tools, unit tests, and end-to-end tests, we should avoid creating factories with random or unpredictable default values (e.g. by using utilities like `pickRandom` to assign property values).

### Intercepting Requests

The [Mock Service Worker](https://mswjs.io/) package intercepts requests at the network level and returns the response you defined in the relevant factory.

Generic example:
```ts
import { http } from "msw";

const handlers = [
  http.get("*/entity/:id", ({ params }) => {
    const id = Number(params.id);
    const entity = entityFactory.build({ id });

    return HttpResponse.json(entity);
  }),
];
```

In this example, when MSW is enabled, any GET request that matches `*/entity/:id` will be intercepted, and the response will be the `entity` JSON object we built from a factory.

The application treats these as _real_ network requests and will behave as though this data is coming from the actual API.

## Dev Tools & MSW

To enable the MSW, open the Local Dev Tools (development only, by clicking the 🛠️ icon in the lower left of your screen). You will be presented with a variety of options to facilitate local development. Click the "Enable MSW" checkbox to get started, then choose a Base Preset:
- "**Preset Mocking**": Will give you the ability to use predefined mock types, available in the "Presets" column underneath. Those presets return static data for commonly used non-dynamic data, and a parameter to customize the API's response time.
- "**CRUD**": The primary mocking mode for Cloud Manager. This mode is an API-like mocking behavior, storing and persisting mock data in the `indexDB` browser storage (`Developer Tools > Application > IndexedDB > MockDB`). Two features are available while using this mode:
  - **`mockState`**: the data a user inputs via Cloud Manager UI. When a handler is defined (`src/mocks/handlers/handler.ts`), it will be stored in the corresponding content type and persist in local storage, unless reset in dev tools or cleared manually.
  - **`seedState`**: the data stored by content seeders (`src/mocks/seeds/seed.ts`) for which the count can be customized in the UI (left panel). This way of populating data is particularly helpful for testing large accounts, pagination and filtering.<br><br>
  The data for both these modes can be interacted with and updated in the UI. However, it is worth mentioning that any seed data deleted in the UI will surface back up in the UI on refresh if still enabled in the Dev Tools.
- "**Legacy MSW handlers**". This preset preserves the MSW legacy data/mode, which is essentially a static set of handlers that covers most (if not all) APIv4 intercepts. **IMPORTANT**: this mode is considered `@deprecated`. It remains available for convenience and backward compatibility, it is however discouraged to add new handlers to it. Those should be added to the CRUD baseline preset instead.
- "**Account Activation Required**", "**API Maintenance Mode**", "**API Offline**" and "**API Unstable**" emulate hard to reproduce cases a user may encounter.

<br>

> [!IMPORTANT]
> In CRUD mode, only data types that have RESTFUL handlers will be mocked. Since this is part of the MSW V2 tooling, only **some** content types are currently supported and return CRUD mock data. Endpoints that are not intercepted will return alpha/beta/production data depending on your chosen environment.<br><br>Please follow existing examples to add handlers and seeders and ensure to use `mswDB` utils to keep your stateful data synced with the `indexedDB` storage.

## Mocking feature flags

Cloud Manager uses [LaunchDarkly](https://github.com/launchdarkly/react-client-sdk) for feature flag management.

To run Cloud Manager without feature flags enabled, either:

- Run the app without `REACT_APP_LAUNCH_DARKLY_ID` defined in `.env`, or:
- In the browser Developer Tools, block network requests to `*launchdarkly*`.

To run Cloud Manager with _specific values_ assigned to feature flags:

1. Use the Cloud Manager Dev Tools Feature Flags panel
2. Run Cloud Manager without feature flags using a method listed above.

```
## Changing user preferences

Since [user preferences are tied to OAuth clients](https://developers.linode.com/api/v4/profile-preferences), to change Cloud Manager preferences you must grab the short-lived token from the app and use that to curl.

As a convenience, there is a preference editor in Cloud accessible by going to `/profile/settings?preferenceEditor=true`. It allows you to enter arbitrary JSON and submit it (validating that it's valid JSON first). This makes it easier to quickly edit preferences when developing features that depend on it. A quick link to those preferences is also available in the Cloud Manager Dev Tools.
