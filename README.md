# imicros-feel
[![Development Status](https://img.shields.io/badge/status-under_development-red)](https://img.shields.io/badge/status-under_development-red)

[Moleculer](https://github.com/moleculerjs/moleculer) service for feel and DMN evaluation

## Installation
```
$ npm install imicros-feel
```
## Dependencies / Requirements
Requires broker middleware AclMiddleware (or similar) and a running acl service:
- [imicros-acl](https://github.com/al66/imicros-acl)

Requires a runnning minio service
- [imicros-minio](https://github.com/al66/imicros-minio)

# Usage
```js
const { ServiceBroker } = require("moleculer");
const { Feel } = require("imicros-feel");

broker = new ServiceBroker({
    logger: console
    // middlewares: [AclMiddleware({service: "acl"})]
});
broker.createService(Feel, Object.assign({ 
    settings: { 
        services: {
            store: "v1.minio"
        }
    }
}));
broker.start();
```
## Actions
- evalute { expression, context } => any  
- convert { xml } => { result(true|false), error?, expression }
- check { expression } => { result(true|false), error? }  
- clearFromCache { objectName } => { done } 

