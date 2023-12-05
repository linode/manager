---
parent: Development Guide
---

# Accessibility

## Tools

Cloud Manager makes use of the [Reach UI](https://reach.tech/) component library to help make the app accessible. Reach UI contains many component primitives which conform to [WAI-ARIA](https://www.w3.org/TR/wai-aria-practices-1.2/) standards.

Currently Cloud Manager uses the `Tabs` and `Menu Button` Reach UI components, though we are interested in moving more of our Material UI components over to Reach UI.

This project also uses the `jsx-a11y` eslint extension, which enforces accessibility best practices in JSX code:

```jsx
<div onClick={() => alert("hi!")}>Click me!</div>
// ^^ error: "Visible, non-interactive elements with click handlers must have at least one keyboard listener."
```

## Auditing for accessibility issues

Google Lighthouse is a great way to audit for potential accessibility issues in the app. To run a report, visit the "Lighthouse" tab in Chrome Dev Tools and select "Accessibility" as a category.

To check screen-reader functionality, you may use MacOS's built-in screen-reader (VoiceOver) or download [JAWS](https://www.freedomscientific.com/products/software/jaws/) and [NVDA](https://www.nvaccess.org) for Windows. NVDA is free and open-source but JAWS requires a license. A free demo is available that can be run for 40 minutes before it reboots.
