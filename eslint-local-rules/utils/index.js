function checkCssPropertyRecursively(css, properties, context, message) {
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
      checkCssPropertyRecursively(
        css,
        property.value.properties,
        context,
        message
      );
    } else if (property.type === "Property" && property.key?.name === "sx") {
      if (property.value?.type === "ObjectExpression") {
        checkCssPropertyRecursively(
          css,
          property.value.properties,
          context,
          message
        );
      }
    } else if (
      property.type === "Property" &&
      property.key?.name === "style" &&
      property.value?.type === "ObjectExpression"
    ) {
      checkCssPropertyRecursively(
        css,
        property.value.properties,
        context,
        message
      );
    }
  }
}

module.exports = {
  checkCssPropertyRecursively,
};
