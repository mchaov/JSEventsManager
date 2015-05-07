/**
 * EVENTS HANDLING
 *
 * Smart events managing by altering the properties of a HTML element
 **
 * usage:

new uiElement({
	    name:               NAME OF YOUR EVENT,
	    eventHtmlElement:   PASS HTML ELEMENT,
	    handler:            ANONYMOS FUNCTION OR FUNCTION PASSED BY REF,
	    eventType:          EVENT TYPE || UI.support.defaultEvent,
        useCapture:         DEFAULT IS FALSE, you can pass TRUE
    });
 **
 * UI.support.defaultEvent -> set to 'click' || 'touchstart' depending on the device
 * example:

new uiElement({
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
 var myEventVariable = new uiElement({...});

 * console.log(myEventVariable) will output the same as console.log(this)
 * from withing the event handler
 *
 * Proper FOR/WHILE loop attach of events - the class is handling the check for that.
 * You can't attach events with the same name.
 */

// This is prototype for elements that are not uiElement
Element.prototype.detach = function () { }; // Element.prototype.FOO, works iOS 8.1+

function uiElement(config)
{
    if (!config)
    {
        return false;
    }
    
	// Self-Invoking Constructor
    // Make sure that a constructor function always behaves like one even
    // if called without `new`.
    if (!(this instanceof uiElement))
    {
        return new uiElement(config);
    }
	
    //apply configuration
    this.eventHtmlElement = config.eventHtmlElement;

    this.eventConfig = {
        useCapture: config.useCapture === undefined ? false : config.useCapture,
        name: config.name,
        handler: config.handler === undefined ? false : config.handler,
        eventType: config.eventType
    };

    this.init();
}

uiElement.prototype = {
    //if someone asks, you are uiElement :)
    constructor: 'uiElement',

    //main function
    init: function ()
    {
        //if HTML element is not UI element
        if (!this.eventHtmlElement.eventsList)
        {

            //add array to store events
            this.eventHtmlElement.eventsList = [];

            //extend model for this element with 'events'
            Object.defineProperty(this.eventHtmlElement, 'events', {

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

            //enables us to check if a specific event is attached by name
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
    },

    //detach event method called from the event object stored in a variable
    //you can also detach one event from within a handler of another event
    detach: function (name)
    {
        var eventName = name === undefined ? this.eventConfig.name : name;
        for (var i = 0; i < this.eventHtmlElement.eventsList.length; i += 1)
        {
            //do we want to detach event different from the one which invokes this method?
            if (name !== undefined && this.eventHtmlElement.eventsList[i].name == eventName)
            {
                var eventData = this.eventHtmlElement.eventsList.splice(i, 1);
                this.eventConfig.eventType = eventData[0].eventType;
                this.eventConfig.handler = eventData[0].handler;

                //if not remove myself from the array of events
            }
            else if (this.eventHtmlElement.eventsList[i].name == eventName)
            {
                this.eventHtmlElement.eventsList.splice(i, 1);
            }
        }

        //detach the event
        this.eventHtmlElement.removeEventListener(this.eventConfig.eventType, this.eventConfig.handler, this.eventConfig.useCapture);
    }
};