export default {
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow non-null assertions (!)',
            recommended: false,
        },
        messages: {
            noNonNull: 'Avoid using non-null assertions (!). Use safer null checks instead.',
        },
        schema: [],
    },

    create(context) {
        return {
            TSNonNullExpression(node) {
                context.report({
                    node,
                    messageId: 'noNonNull',
                });
            },
        };
    },
};