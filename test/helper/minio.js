"use strict";

const fs = require("fs");

// mock minio service
const Minio = {
    name: "minio",
    version: 1,
    actions: {
        get: {
            handler(ctx) {
                if (!ctx.params || !ctx.params.objectName) throw new Error("Missing object name");
                const filePath = `./assets/${ ctx.params.objectName }`;
                const xmlData = fs.readFileSync(filePath).toString();
                return xmlData;
            }
        }
    }
};

module.exports = {
    Minio
};
