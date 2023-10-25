"use strict";

module.exports = {
  "no-custom-fontWeight": {
    create(context) {
      const isFontWeightDeclared = (node) => {
        node.declarations.map((declarator) => {
          if (declarator?.id?.name === "useStyles") {
            declarator?.init?.arguments?.[0]?.body?.properties?.map(
              (property) => {
                property?.value?.properties?.map((prop) => {
                  if (prop?.key?.name === "fontWeight") {
                    context.report({
                      node: property,
                      message:
                        "Avoid using fontWeight declaration in our code since we declare font weight using fontFamily",
                    });
                  }
                });
              }
            );
          }
        });

        return false;
      };
      return {
        VariableDeclaration: (node) => {
          isFontWeightDeclared(node);
        },
      };
    },
    meta: {
      docs: {
        description: "Disallow the use of fontWeight in MUI styles",
        recommended: true,
        url: null,
      },
      fixable: null,
      type: "problem",
    },
  },
};
