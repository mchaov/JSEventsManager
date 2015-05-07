# JSEventsManager
Manage DOM events in a smarter way.

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