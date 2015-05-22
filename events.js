/**
 * EVENTS HANDLING
 *
 * Smart events managing by altering the properties of a HTML element
 **
 * usage:

new UIElement({
        name:               NAME OF YOUR EVENT,
        eventHtmlElement:   PASS HTML ELEMENT,
        handler:            ANONYMOS FUNCTION OR FUNCTION PASSED BY REF,
        eventType:          EVENT TYPE
        useCapture:         DEFAULT IS FALSE, you can pass TRUE
    });
 **
 * example:

new UIElement({
        name:               'My event',
        eventHtmlElement:   document.getElementById('myElement');
        handler:            function(){alert('it works')},
        eventType:          'click'
    });

document.getElementById('myElement').hasEvent(EVENT NAME);  -> true or false
document.getElementById('myElement').detach(EVENT NAME);    -> detaches the requested event
document.getElementById('myElement').detach();              -> detaches all events
document.getElementById('myElement').events                 -> returns array of all attached events if any

//inside the events handler
this.detach()                                               -> detaches self
this.detach('name')                                         -> detaches other event

 * Inside the event handler 'this' refers to the event attached
 * and stores its configuration and a reference to the HTML element.
 **
 * You can detach these events from within the handler like this:
 this.eventHtmlElement.detach(this.eventConfig.name)

 *
 * If you need to control it from somewhere else you can store the event
 * into a variable and access it from there like this:
 var myEventVariable = new UIElement({...});

 * console.log(myEventVariable) will output the same as console.log(this)
 * from withing the event handler
 *
 * Proper FOR/WHILE loop attach of events - the class is handling the check for that.
 * You can't attach events with the same name.
 */

var UIElement = (function()
{
    'use strict';

    // Empty function
    function noop() {}

    if (typeof Object.prototype.detach === 'undefined')
    {
        // This prevents showing an error if you try to evoke the detach method of
        // non EventObject.
        // NOTE: Element.prototype.foo works in iOS 8.1+
        Object.prototype.detach = noop;
    }

    if (typeof Object.prototype.hasEvent === 'undefined')
    {
        // This prevents showing an error if you try to evoke the detach method of
        // non EventObject.
        Object.prototype.hasEvent = noop;
    }

    function UIElement(config)
    {
        if (!config)
        {
            return false;
        }

        // Self-Invoking Constructor
        // Make sure that a constructor function always behaves like one even
        // if called without `new`.
        if (!(this instanceof UIElement))
        {
            return new UIElement(config);
        }

        // Apply configuration
        this.eventHtmlElement = config.eventHtmlElement;

        this.eventConfig = {
            name: config.name,
            eventType: config.eventType,
            handler: config.handler === undefined ? false : config.handler,
            useCapture: config.useCapture === undefined ? false : config.useCapture
        };

        this.init();
    }

    //main function
    UIElement.prototype.init = function ()
    {
        //if HTML element is not UI element
        if (!this.eventHtmlElement.eventsList)
        {
            //add array to store events
            this.eventHtmlElement.eventsList = [];

            //extend model for this element with 'events'
            Object.defineProperty(this.eventHtmlElement, 'events',
            {
                //if no value passed return all values stored
                get: function ()
                {
                    return this.eventsList;
                },

                //if value is passed, push into the array
                set: function (e)
                {
                    this.eventsList.push(e);
                }
            });

            // nables us to check if a specific event is attached by name
            this.eventHtmlElement.hasEvent = function (name)
            {
                for (var i = 0; i < this.eventsList.length; i += 1)
                {
                    if (this.eventsList[i].name == name)
                    {
                        return true;
                    }
                }

                return false;
            };

            //enables us to detach specific or all events
            this.eventHtmlElement.detach = function (name)
            {
                var i, ev, eventType, handler, useCapture;
                //detach all events if no event specified
                if (name === undefined || name === '')
                {
                    for (i = 0; i < this.eventsList.length; i += 1)
                    {
                        ev = this.eventsList[i];
                        eventType = ev.eventType;
                        handler = ev.handler;
                        useCapture = ev.useCapture;
                        this.removeEventListener(eventType, handler, useCapture);
                    }
                    this.eventsList = [];

                    //check for and detach if event is attached
                }
                else if (this.hasEvent(name))
                {
                    for (i = 0; i < this.eventsList.length; i += 1)
                    {
                        if (this.eventsList[i].name == name)
                        {
                            ev = this.eventsList.splice(i, 1)[0];
                            useCapture = ev.useCapture;
                            eventType = ev.eventType;
                            handler = ev.handler;
                        }
                    }
                    this.removeEventListener(eventType, handler, useCapture);
                }
                //if proper condition is not met
                return false;
            };
        }
        //if this event exist ... do nothing
        else if (this.eventHtmlElement.hasEvent(this.eventConfig.name))
        {
            return false;
        }

        //pass scope, apply event, save configuration for future uses
        this.eventConfig.handler = this.eventConfig.handler.bind(this);
        this.eventHtmlElement.addEventListener(this.eventConfig.eventType, this.eventConfig.handler, this.eventConfig.useCapture);
        this.eventHtmlElement.events = this.eventConfig;
    };

    //detach event method called from the event object stored in a variable
    //you can also detach one event from within a handler of another event
    UIElement.prototype.detach = function (name)
    {
        var eventName = name === undefined ? this.eventConfig.name : name,
            eventData;

        //we need this to be able to find where in the array is our event
        //so we could remove it from it
        for (var i = 0; i < this.eventHtmlElement.eventsList.length; i += 1)
        {
            if (this.eventHtmlElement.eventsList[i].name === eventName)
            {
                //remove myself from the array of events
                eventData = this.eventHtmlElement.eventsList.splice(i, 1);

                //do we want to detach event different from the one which invokes this method?
                if (name !== undefined)
                {
                    this.eventConfig.eventType = eventData[0].eventType;
                    this.eventConfig.handler = eventData[0].handler;
                }
            }
        }

        //detach the event
        this.eventHtmlElement.removeEventListener(this.eventConfig.eventType, this.eventConfig.handler, this.eventConfig.useCapture);
    };

    return UIElement;
}());
