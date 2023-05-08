module.exports = {
    ci: {
        collect: {
            /* Add configuration here */
            startServerCommand: 'yarn up',
            url: ['http://localhost:3000/linodes']
        },
        upload: {
            /* Add configuration here */
            target: 'temporary-public-storage',
        },
    },
};