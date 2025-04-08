# Analytics

## Pendo

Cloud Manager uses [Pendo](https://www.pendo.io/pendo-for-your-customers/) to capture analytics, guide users, and improve the user experience. Pendo is the **preferred** method for collecting analytics, including user events, since it requires no development effort and can be accomplished via the Pendo UI.

To view Pendo dashboards, Cloud Manager developers must follow internal processes to request access.

### Set Up and Initialization

Pendo is configured in [`usePendo.js`](https://github.com/linode/manager/blob/develop/packages/manager/src/hooks/usePendo.ts). This custom hook allows us to initialize the Pendo analytics script when the [App](https://github.com/linode/manager/blob/develop/packages/manager/src/App.tsx#L56) is mounted.

Important notes:

- Pendo is only loaded if the user has enabled Performance Cookies via OneTrust *and* if a valid `PENDO_API_KEY` is configured as an environment variable. In our development, staging, and production environments, `PENDO_API_KEY` is available at build time. See **Locally Testing Page Views & Custom Events and/or Troubleshooting Pendo** for set up with local environments.
- We load the Pendo agent from the CDN, rather than [self-hosting](https://support.pendo.io/hc/en-us/articles/360038969692-Self-hosting-the-Pendo-agent), and we have configured a [CNAME](https://support.pendo.io/hc/en-us/articles/360043539891-CNAME-for-Pendo).
- At initialization, we do string transformation on select URL patterns to **remove  sensitive data**. When new URL patterns are added to Cloud Manager, verify that existing transforms remove sensitive data; if not, update the transforms.
- Pendo will respect OneTrust cookie preferences in development, staging, and production environments and does not check cookie preferences in the local environment.
- Pendo makes use of the existing `data-testid` properties, used in our automated testing, for tagging elements. They are more persistent and reliable than CSS properties, which are liable to change.

### Locally Testing Page Views & Custom Events and/or Troubleshooting Pendo

1. Set the `REACT_APP_PENDO_API_KEY` environment variable in `.env`.
2. Use the browser tools Network tab, filter requests by "psp.cloud", and check that successful network requests have been made to load Pendo scripts (also visible in the browser tools Sources tab).
3. In the browser console, type `pendo.validateEnvironment()`.
4. You should see command output in the console, and it should include an `accountId` and a `visitorId` that correspond with your APIv4 account `euuid` and profile `uid`, respectively. Each page view change or custom event that fires should be visible as a request in the Network tab.
5. If the console does not output the expected ids and instead outputs something like `Cookies are disabled in Pendo config. Is this expected?` in response to the above command, clear app storage with the browser tools. Once redirected back to Login, update the OneTrust cookie settings to enable cookies via "Manage Preferences" in the banner at the bottom of the screen. Log back into Cloud Manager and Pendo should load.

## Adobe Analytics

Cloud Manager uses Adobe Analytics to capture page view and custom event statistics, although Pendo is the preferred method for collecting this data where possible, as of Q4 2024. To view analytics, Cloud Manager developers must follow internal processes to request access to Adobe Analytics dashboards.

### Writing a Custom Event

Custom events live (mostly) in `src/utilities/analytics/customEventAnalytics.ts`. Try to write and export custom events in this file if possible, and import them in the component(s) where they are used.

A custom event will take this shape:

```tsx
// Component.tsx {file(s) where the event is called, for quick reference}
// OtherComponent.tsx

sendDescriptiveNameEvent () => {
      category: '{Descriptive/Page/Flow Name}',
      action: '{interaction such as Click, Hover, Focus}:{input type such as button, link, toggle, checkbox, text field} e.g. Click:link',
      label: '{string associated with the event; e.g event label} (optional)',
      value: '{number associated with the event; e.g. size of a volume} (optional)',
      data: '{stringified object of additional key-value pairs; e.g. "{isLinodePoweredOff: true}"} (optional)'
}
```

When adding a new custom event, coordinate with UX on the event's `category`, `action`, `label`, and `value` variables to ensure consistency across our data.

`data` is an additional variable we use to capture information associated with an event that cannot easily or clearly be represented via the other variables; for example, boolean key-value pair(s). To add an additional property to `data`, it should first be added as an optional property and typed in the `CustomAnalyticsData` interface.

Avoid including pipes (`|`) as delimiters in any of the event properties. They are used in Adobe Analytics to separate fields.

Avoid creating custom events that collect such as search queries, entity names, or other forms of user input. Custom events can still be fired on these actions with a generic `label` or no label at all.

Examples

- `sendMarketplaceSearchEvent` fires when selecting a category from the dropdown (`label` is predefined) and clicking the search field (a generic `label` is used).
- `sendBucketCreateEvent` sends the region of the bucket, but does not send the bucket label.

### Writing Form Events

Form events differ from custom events because they track user's journey through a flow and, optionally, branching flows. Form events live in `src/utilities/analytics/formEventAnalytics.ts`. Try to write and export custom events in this file if possible, and import them in the component(s) where they are used.

When tracking a new form flow, work with UX to:

- Determine a `formName` to use across the flow
- Determine what elements of the form to track
- Follow our naming conventions (use our util: `getFormattedStringFromFormEventOptions`)

These are the form events we use:

- `formStart`: To track the beginning of the form at the designated element
- `formInput`: To track any form interaction (click, change, clear) that is not another type of form event; this event is **not** limited to form input fields
- `formStep`: To track the successful completion of a **branching** flow (e.g. submitting in a drawer within a Create page)
- `formSubmit`: To track the successful completion of the **main** flow
- `formError`: To track the unsuccessful completion of the main flow with the errors encountered by the user

See the `LinodeCreateForm` form events as an example.

### Locally Testing Page Views & Custom Events and/or Troubleshooting Adobe Analytics

1. Set the `REACT_APP_ADOBE_ANALYTICS_URL` environment variable in `.env`.
2. Use the browser tools Network tab, filter requests by "adobe", and check that successful network requests have been made to load the launch script and its extensions.
3. In the browser console, type `_satellite.setDebug(true)`.
4. Refresh the page. You should see Adobe debug log output in the console. Each page view change or custom event that fires should be visible in the logs.
5. When viewing dashboards in Adobe Analytics, it may take ~1 hour for analytics data to update. Once this happens, locally fired events will be visible in the dev dashboard.
