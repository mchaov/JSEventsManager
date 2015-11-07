/**
 * EVENTS HANDLING
 *
 * Smart events managing by altering the properties of a HTML element
 **
 * usage:

 new UIEvent({
	 name:          NAME OF YOUR EVENT,
	 htmlRef:		PASS HTML ELEMENT,
	 handler:		ANONYMOS FUNCTION OR FUNCTION PASSED BY REF,
	 type:			EVENT TYPE
	 useCapture:	DEFAULT IS FALSE, you can pass TRUE
 });
 **
 * example:

 new UIEvent({
     name:		'My event',
     htmlRef:	document.getElementById('myElement'),
     handler:	function(){alert('it works')},
     type:		'click'
 });

 document.getElementById('myElement').hasEvent(EVENT NAME);  -> HANDLER or false
 document.getElementById('myElement').detach(EVENT NAME);    -> detaches the requested event
 document.getElementById('myElement').detach();              -> detaches all events
 document.getElementById('myElement').events                 -> returns array of all attached events if any
 document.getElementById('myElement').trigger(EVENT NAME)    -> calls the handler

 //inside the events handler
 this.detach()                                               -> detaches self
 this.detach('name')                                         -> detaches other event
 this.trigger()                                         	 -> triggers self

 * Inside the event handler 'this' refers to the event attached
 * and stores its configuration and a reference to the HTML element.
 **
 * You can detach these events from within the handler like this:
 this.htmlRef.detach(this.eventConfig.name)

 *
 * If you need to control it from somewhere else you can store the event
 * into a variable and access it from there like this:
 var myEventVariable = new UIEvent({...});

 * console.log(myEventVariable) will output the same as console.log(this)
 * from withing the event handler
 *
 * Proper FOR/WHILE loop attach of events - the class is handling the check for that.
 * You can't attach events with the same name.
 */

var UIEvent = ( function() {
        'use strict';

        // Empty function
        function noop() {
			return false;
        }

		if ( typeof Object.prototype.detach === 'undefined') {
            // This prevents showing an error if you try to evoke the detach method of
            // non EventObject.
            // NOTE: Element.prototype.foo works in iOS 8.1+
            Object.defineProperty(Object.prototype, 'detach', {
                writable: true,
                enumerable: false,
                configurable: true,
                value: noop
            });
        }

        if ( typeof Object.prototype.hasEvent === 'undefined') {
            // This prevents showing an error if you try to evoke the detach method of
            // non EventObject.
            Object.defineProperty(Object.prototype, 'hasEvent', {
                writable: true,
                enumerable: false,
                configurable: true,
                value: noop
            });
        }
		
        if ( typeof Object.prototype.trigger === 'undefined') {
            // This prevents showing an error if you try to evoke the detach method of
            // non EventObject.
            Object.defineProperty(Object.prototype, 'trigger', {
                writable: true,
                enumerable: false,
                configurable: true,
                value: noop
            });
        }
		
        function UIEvent(config) {
            if (!config) {
                return false;
            }

            // Self-Invoking Constructor
            // Make sure that a constructor function always behaves like one even
            // if called without `new`.
            if ((this instanceof UIEvent) === false) {
                return new UIEvent(config);
            }

            // Apply configuration
            this.htmlRef = config.htmlRef;

            this.eventConfig = {
                name : config.name,
                type : config.type,
                handler : config.handler === undefined ? false : config.handler,
                useCapture : config.useCapture === undefined ? false : config.useCapture
            };

            this.init();
        }

        //main function
        UIEvent.prototype.init = function() {
            //if HTML element is not UI element
            if (this.htmlRef.eventsList === undefined) {

                //extend model for this element with 'events'
                Object.defineProperties(this.htmlRef, {

                    //add array to store events
                    'eventsList' : {
                        writable : true,
                        enumerable : false,
                        configurable : false,
                        value : []
                    },

                    //short-cut to add new or get all events
                    'events' : {
                        enumerable : false,
                        configurable : false,

                        //if no value passed return all values stored
                        get : function() {
                            return this.eventsList;
                        },

                        //if value is passed, push into the array
                        set : function(e) {
                            this.eventsList.push(e);
                        }
                    },

                    //trigger event by name
                    'trigger' : {
                        writable : false,
                        enumerable : false,
                        configurable : false,
                        value : function(name) {
                            var evt = this.hasEvent(name);

                            if ( typeof evt.handler === 'function') {
                                return evt.handler();
                            }

                            return false;
                        }
                    },

                    //enables us to check if a specific event is attached by name
                    //if the event exist it returns the event, if not - false
                    'hasEvent' : {
                        writable : false,
                        enumerable : false,
                        configurable : false,
                        value : function(name) {
                            for (var i = 0; i < this.eventsList.length; i += 1) {
                                if (this.eventsList[i].name === name) {
                                    return this.eventsList[i];
                                }
                            }

                            return false;
                        }
                    },

                    //enables us to detach specific or all events
                    'detach' : {
                        writable : false,
                        enumerable : false,
                        configurable : false,
                        value : function(name) {
                            var i,
                                ev,
                                type,
                                handler,
                                useCapture;

                            //detach all events if no event specified
                            if (name === undefined || name === '') {
                                for ( i = 0; i < this.eventsList.length; i += 1) {
                                    ev = this.eventsList[i];
                                    type = ev.type;
                                    handler = ev.handler;
                                    useCapture = ev.useCapture;
                                    this.removeEventListener(type, handler, useCapture);
                                }
                                this.eventsList = [];

                                //check for and detach if event is attached
                            } else if (this.hasEvent(name)) {
                                for ( i = 0; i < this.eventsList.length; i += 1) {
                                    if (this.eventsList[i].name === name) {
                                        ev = this.eventsList.splice(i, 1)[0];
                                        useCapture = ev.useCapture;
                                        type = ev.type;
                                        handler = ev.handler;
                                    }
                                }
                                this.removeEventListener(type, handler, useCapture);
                            }

                            //if proper condition is not met
                            return false;
                        }
                    }
                });
            }
            //if this is initialized element ... do nothing
            else if (this.htmlRef.hasEvent(this.eventConfig.name)) {
                return false;
            }

            //pass scope, apply event, save configuration for future uses
            this.eventConfig.handler = this.eventConfig.handler.bind(this);
            this.htmlRef.addEventListener(this.eventConfig.type, this.eventConfig.handler, this.eventConfig.useCapture);
            this.htmlRef.events = this.eventConfig;
        };


        Object.defineProperties(UIEvent.prototype, {

            //detach event method called from the event object stored in a variable
            //you can also detach one event from within a handler of another event
            'detach': {
                writable: false,
                enumerable: false,
                configurable: false,
                value: function(name) {
                    var eventName = name === undefined ? this.eventConfig.name : name,
                        eventData;

                    //we need this to be able to find where in the array is our event
                    //so we could remove it from it
                    for (var i = 0; i < this.htmlRef.eventsList.length; i += 1) {
                        if (this.htmlRef.eventsList[i].name === eventName) {
                            //remove myself from the array of events
                            eventData = this.htmlRef.eventsList.splice(i, 1);

                            //do we want to detach event different from the one which invokes this method?
                            if (name !== undefined) {
                                this.eventConfig.type = eventData[0].type;
                                this.eventConfig.handler = eventData[0].handler;
                            }
                        }

                    }

                    //detach the event
                    this.htmlRef.removeEventListener(this.eventConfig.type, this.eventConfig.handler, this.eventConfig.useCapture);
                }
            },

            //trigger self
            'trigger': {
                writable: false,
                enumerable: false,
                configurable: false,
                value: function() {
                    if(typeof this.eventConfig.handler === 'function') {
                        return this.eventConfig.handler();
                    }

                    return false;
                }
            }

        });

        return UIEvent;
    }());
