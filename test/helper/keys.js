"use strict";

const { v4: uuid } = require("uuid");

const testKeys = {
    current: uuid(),
    previous: uuid()
};


// mock keys service
const Keys = {
    name: "keys",
    version: 1,
    actions: {
        getOek: {
            handler(ctx) {
                if (!ctx.params || !ctx.params.service) throw new Error("Missing service name");
                if ( ctx.params.id == testKeys.previous ) {
                    return {
                        id: testKeys.previous,
                        key: "myPreviousSecret"
                    };    
                }
                return {
                    id: testKeys.current,
                    key: "mySecret"
                };
            }
        }
    }
};

module.exports = {
    testKeys,
    Keys
};
