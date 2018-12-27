// vue.config.js
const path = require('path');
module.exports = {
    configureWebpack: {
        resolve: {
            alias: {
                vue$: "vue/dist/vue.common",
                "@rtt": path.resolve(__dirname, "src/runtime-templates"),
                "@c": path.resolve(__dirname, "src/components"),
                "@assets": path.resolve(__dirname, "src/assets")
            },
        },
    },
};