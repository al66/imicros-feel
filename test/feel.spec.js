"use strict";
const { ServiceBroker } = require("moleculer");
const { Feel } = require("../index");

// mocks & helpers
const { AclMiddleware } = require("./helper/acl");
const { Keys, testKeys } = require("./helper/keys");
const { Minio } = require("./helper/minio");

describe("Test context service", () => {

    let broker, service, opts = {}, keyService;
    beforeAll(() => {
    });
    
    afterAll(async () => {
    });
    
    describe("Test create service", () => {

        it("it should start the broker", async () => {
            broker = new ServiceBroker({
                middlewares:  [AclMiddleware],
                logger: console,
                logLevel: "info" //"debug"
            });
            broker.createService(Keys);
            broker.createService(Minio);
            service = await broker.createService(Feel, Object.assign({ 
                settings: { 
                    cassandra: {
                        contactPoints: process.env.CASSANDRA_CONTACTPOINTS || "127.0.0.1", 
                        datacenter: process.env.CASSANDRA_DATACENTER || "datacenter1", 
                        keyspace: process.env.CASSANDRA_KEYSPACE_FLOW || "imicros_flow" 
                    },
                    services: {
                        keys: "v1.keys",
                        store: "v1.minio"
                    }
                }
            }));
            await broker.start();
            expect(service).toBeDefined();
        });

    });
    
    describe("Test feel ", () => {

        it("it should evaluate an string expression", () => {
            let params = {
                expression: "a+b",
                context: { a: 5, b: 7 }
            };
            return broker.call("feel.evaluate", params, opts).then(res => {
                expect(res).toBeDefined();
                expect(res).toEqual(12);
            });
        });
        
        /*
        it("it should evaluate xml", () => {
            let params = {
                expression: { xml: "test" },
                context: { a: 5, b: 7 }
            };
            return broker.call("feel.evaluate", params, opts).then(res => {
                expect(res).toBeDefined();
                console.log(res);
            });
        });
        */
        
        it("it should convert xml", () => {
            let params = {
                xml: {
                    objectName: "Sample.dmn"
                }
            };
            return broker.call("feel.convert", params, opts).then(res => {
                expect(res).toBeDefined();
                expect(res.result).toEqual(true);
                expect(res.expression).toBeDefined();
                //console.log(res);
            });
        });
        
        it("it should evaluate as stored expression", () => {
            let params = {
                expression: { objectName: "Sample.dmn" },
                context: {
                    "Credit Score": { FICO: 700 }, 
                    "Applicant Data": { Monthly: { Repayments: 1000, Tax: 1000, Insurance: 100, Expenses: 500, Income: 5000 } },
                    "Requested Product": { Amount: 600000, Rate: 0.0375, Term: 360 }
                }
            };
            return broker.call("feel.evaluate", params, opts).then(res => {
                expect(res).toBeDefined();
                expect(res).toEqual({
                    'Credit Score': { FICO: 700 },
                    'Applicant Data': {
                      Monthly: {
                        Repayments: 1000,
                        Tax: 1000,
                        Insurance: 100,
                        Expenses: 500,
                        Income: 5000
                      }
                    },
                    'Requested Product': { Amount: 600000, Rate: 0.0375, Term: 360 },
                    'Credit Score Rating': 'Good',
                    'Back End Ratio': 'Sufficient',
                    'Front End Ratio': 'Sufficient',
                    'Loan PreQualification': {
                      Qualification: 'Qualified',
                      Reason: 'The borrower has been successfully prequalified for the requested loan.'
                    }
                });
                // console.log(res);
            });
        });

        it("it should evaluate as stored expression from cache", () => {
            let params = {
                expression: { objectName: "Sample.dmn" },
                context: {
                    "Credit Score": { FICO: 700 }, 
                    "Applicant Data": { Monthly: { Repayments: 1000, Tax: 1000, Insurance: 100, Expenses: 500, Income: 5000 } },
                    "Requested Product": { Amount: 600000, Rate: 0.0375, Term: 360 }
                }
            };
            return broker.call("feel.evaluate", params, opts).then(res => {
                expect(res).toBeDefined();
                expect(res).toEqual({
                    'Credit Score': { FICO: 700 },
                    'Applicant Data': {
                      Monthly: {
                        Repayments: 1000,
                        Tax: 1000,
                        Insurance: 100,
                        Expenses: 500,
                        Income: 5000
                      }
                    },
                    'Requested Product': { Amount: 600000, Rate: 0.0375, Term: 360 },
                    'Credit Score Rating': 'Good',
                    'Back End Ratio': 'Sufficient',
                    'Front End Ratio': 'Sufficient',
                    'Loan PreQualification': {
                      Qualification: 'Qualified',
                      Reason: 'The borrower has been successfully prequalified for the requested loan.'
                    }
                });
                // console.log(res);
            });
        });
        
    });
 
    describe("Test stop broker", () => {
        it("should stop the broker", async () => {
            expect.assertions(1);
            await broker.stop();
            expect(broker).toBeDefined();
        });
    });
    
});