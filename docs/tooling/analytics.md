# Adobe Analytics

Cloud Manager uses Adobe Analytics to capture page view and custom event statistics. To view analytics, Cloud Manager developers must follow internal processes to request access to Adobe Analytics dashboards.

## Writing a Custom Event

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

## Locally Testing Page Views & Custom Events and/or Troubleshooting

1. Set the `REACT_APP_ADOBE_ANALYTICS_URL` environment variable in `.env`.
2. Use the browser tools Network tab, filter requests by "adobe", and check that successful network requests have been made to load the launch script and its extensions.
3. In the browser console, type `_satellite.setDebug(true)`.
4. Refresh the page. You should see Adobe debug log output in the console. Each page view change or custom event that fires should be visible in the logs.
5. When viewing dashboards in Adobe Analytics, it may take ~1 hour for analytics data to update. Once this happens, locally fired events will be visible in the dev dashboard.
