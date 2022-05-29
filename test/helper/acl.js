"use strict";

const timestamp = Date.now();
const ownerId = `owner-${timestamp}`;

const user = {
    id: `1-${timestamp}` , 
    email: `1-${timestamp}@host.com` 
};

// moch acl middelware
const AclMiddleware = {
    localAction(next, action) {
        return async function(ctx) {
            ctx.meta = Object.assign(ctx.meta,{
                ownerId: ownerId,
                acl: {
                    accessToken: "this is the access token",
                    ownerId: ownerId,
                    unrestricted: true
                },
                user 
            });
            ctx.broker.logger.debug("ACL meta data has been set", { meta: ctx.meta, action: action });
            return next(ctx);
        };
    }    
};


module.exports = {
    user,
    AclMiddleware
};
