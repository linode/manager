/**
 * Check if the css property is used in the object recursively
 * The object can be a styled component, a makeStyles hook, or a JSX element with sx or style
 */
export function checkCssPropertyRecursively({
  css,
  properties,
  context,
  message,
}) {
  for (const property of properties) {
    if (
      property.type === "Property" &&
      (property.key?.name === css.key ||
        (property.key?.type === "Literal" &&
          property.key.value === css.literal))
    ) {
      context.report({
        node: property,
        message,
      });
    } else if (
      property.type === "Property" &&
      property.value?.type === "ObjectExpression"
    ) {
      checkCssPropertyRecursively({
        css,
        properties: property.value.properties,
        context,
        message,
      });
    } else if (property.type === "Property" && property.key?.name === "sx") {
      if (property.value?.type === "ObjectExpression") {
        checkCssPropertyRecursively({
          css,
          properties: property.value.properties,
          context,
          message,
        });
      }
    } else if (
      property.type === "Property" &&
      property.key?.name === "style" &&
      property.value?.type === "ObjectExpression"
    ) {
      checkCssPropertyRecursively({
        css,
        properties: property.value.properties,
        context,
        message,
      });
    }
  }
}
