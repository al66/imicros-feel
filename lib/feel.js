/**
 * @license MIT, imicros.de (c) 2022 Andreas Leinen
 */
 "use strict";

 const { Interpreter } = require("imicros-feel-interpreter");
 const { DMNConverter } = require("imicros-feel-interpreter");

module.exports = {
    name: "feel",

    /**
     * Service settings
     */
    settings: {},
    $secureSettings: ["cassandra.user","cassandra.password"],

    /**
     * Service metadata
     */
    metadata: {},

    /**
     * Service dependencies
     */
    dependencies: [],	
 
    /**
     * Actions
     */
    actions: {

        /**
         * evaluate either an expression, a DMN file (as xml string) or a stored xml with the given context 
         * 
         * @actions
         * @param {string|object} expression - FEEL expression as a string, or { xml } where xml is the content of an DMN file, or { objectName } where objectName points to the stored xml
         * @param {object} context - given context for the expression to be evaluated
         * 
         * @returns {string|boolean|number|object} result 
         */
        evaluate: {
            acl: "before",
            params: {
                expression: [
                    { type: "string" },
                    { type: "object", props: { objectName: { type: "string" } } },
                    { type: "object", props: { xml: { type: "string" } } }
                ],
                context: { type: "object" }
            },			
            async handler(ctx) {
                let expression = ctx.params.expression;
                const key = expression?.xml ? `${ ctx.meta.ownerId }-${ this.hashCode(expression.xml) }` : (expression?.objectName ? `${ ctx.meta.ownerId }-${ expression.objectName }` : `${ ctx.meta.ownerId }-${ this.hashCode(expression) }`);
                let ast = this.getFromCache({ key });
                if (!ast) {
                    // get expression
                    if (expression?.objectName) {
                        const xml = await ctx.call(`${ this.services.store }.get`,{ objectName: expression.objectName });
                        expression = this.convert({ xml }).expression;
                    }
                    if (expression?.xml) expression = this.convert({ xml: expression.xml }).expression;
                    // parse
                    const result = this.parse({ expression });
                    ast = result.ast;
                    // add to cache
                    this.addToCache({ key, value: result.ast });
                }

                return this.evaluate({ ast, context: ctx.params.context });
            }
        },

        // convert { xml } => { result(true|false), error?, expression }
        convert: {
            acl: "before",
            params: {
                xml: [
                    { type: "string" },
                    { type: "object", props: { objectName: { type: "string" } } }
                ]
            },			
            async handler(ctx) {
                let xml = ctx.params.xml;
                if (typeof ctx.params.xml === "object") xml = await ctx.call(`${ this.services.store }.get`,{ objectName: ctx.params.xml?.objectName }); 
                return this.convert({ xml });
            }
        }

    },

    /**
     * Events
     */
    events: {},

    /**
     * Methods
     */
    methods: {

        parse({ expression }) {
            const result = this.interpreter.parse(expression);
            if (result) return { ast: this.interpreter.ast };
        },

        evaluate({ ast = null, expression = "", context ={} }) {
            if (ast) {
                this.interpreter.ast = ast;
                return this.interpreter.evaluate({ context });
            } else {
                return this.interpreter.evaluate({ expression, context });
            }
        },

        convert({ xml = null }) {
            try {
                return {
                    result: true,
                    expression: new DMNConverter().convert({ xml })
                };    
            } catch (e) {
                return {
                    result: false,
                    error: e.message
                }
            }
        },

        // unsecure hash - just used for cache
        hashCode(str) {
            var hash = 0;
            for (var i = 0; i < str.length; i++) {
                var char = str.charCodeAt(i);
                hash = ((hash<<5)-hash)+char;
                hash = hash & hash; // Convert to 32bit integer
            }
            return hash;
        },

        getFromCache({ key }) {
            if (!this.cache) this.cache = [];
            const found = this.cache.find(element => element.key === key);
            return found ? found.value : null;
        },

        addToCache({ key, value }) {
            if (!this.cache) this.cache = [];
            this.cache.push({ key, value});
            if (this.cache.length > 100) this.cache.shift();
        }

    },

    /**
     * Service created lifecycle event handler
     */
    created () {

        // set actions
        this.services = {
            keys: this.settings?.services?.keys ?? "keys",
            store: this.settings?.services?.store ?? "minio"
        };        


    },

    /**
     * Service started lifecycle event handler
     */
    async started() {

        // connect to db
        // await this.connect();
  
        this.interpreter = new Interpreter();
         
    },

    /**
     * Service stopped lifecycle event handler
     */
    async stopped() {
        
        // disconnect from db
        // await this.disconnect();
        
    }

};