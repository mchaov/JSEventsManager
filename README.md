# JSEventsManager
This small piece of JS code is intended to solve problems with DOM Events in development of large scale applications.
JavaScript DOM events are becoming unmanageable over time.

## Main issues with existing interface (addEventListener)

1. No return value
2. No way to test if you succeeded in attaching your event without actually performing it
3. No way accessing an 'event' object from outside the handler
4. Workarounds for triggering events over elements
5. No way of triggering only specific handler attached to the same event type on the same element
6. Hard to manage lambda expressions
7. No way to detach all event handlers
8. No good way to do automation testing


## What/How does UIElement class fixes the issues above

1. Return value is object that is instance of UIElement
2. Check the return value for htmlElement, handler, and configuration on general
3. Assign the return value to an object property or variable to assume control over it
4. Use .trigger('EvtName'); when accessing the DOM element or over the variable from point 3.
5. Trigger events by their names
6. Events are attached by unique given name (by the programmer), thus lambdas are no longer anonymous
7. Use method to detach all attached events
8. Allows for automation tests to be written using it's interface



# Technology behind it

1. JavaScript ES5 Strict
2. No dependencies to any library
3. Class like structure, returns objects of it's type with interface to control them



# Examples

## Explanation of structure
`UIElement({
	//mandatory
	name:			{STRING} - name of event
	htmlRef:		{HTMLElement} - one element passed by reference
	handler:		{FUNCTION} - passed by reference or just lambda
	type:			{STRING} - event type

	//optional
	useCapture:		{BOOL} - 'false' || 'true'
	context:		{OBJECT} - 'this' || passed custom context
});`

## Method 1
`
var htmlRef = document.getElementById('myElement');
UIElement({
	name:		'My event',
	htmlRef:	htmlRef,
	handler:	function(){alert('it works')},
	type:		'click'
});

htmlRef.events                 -> returns object with attached events as properties
htmlRef.hasEvent(EVENT NAME);  -> HANDLER or false
htmlRef.detach(EVENT NAME);    -> detaches the requested event
htmlRef.detach();              -> detaches all events
htmlRef.trigger(EVENT NAME)    -> calls the handler
`

## Method 2
`var foo = new UIElement({
	name:		'My event',
	htmlRef:	htmlRef,
	handler:	bar,
	type:		'click'
});

function bar(){
	this.eventConfig		-> {context, handler, htmlRef, name, type, useCapture}
	
	this.detach()			-> detaches self
	this.detach('name')		-> detaches other event
	
	this.trigger()			-> triggers self
	this.trigger('name')	-> triggers other event
	
	//this will work as well
	this.eventConfig.htmlRef.hasEvent(EVENT NAME);  -> HANDLER or false
	this.eventConfig.htmlRef.detach(EVENT NAME);    -> detaches the requested event
	this.eventConfig.htmlRef.detach();              -> detaches all events
	this.eventConfig.htmlRef.events                 -> returns object with attached events as properties
	this.eventConfig.htmlRef.trigger(EVENT NAME)    -> calls the handler
}

These are going to work as well:
foo.detach();
foo.detach('name');
foo.trigger();
foo.trigger('name');
foo.eventConfig;
foo.eventConfig.htmlRef.hasEvent(EVENT NAME);
foo.eventConfig.htmlRef.detach(EVENT NAME);
foo.eventConfig.htmlRef.detach();
foo.eventConfig.htmlRef.events
foo.eventConfig.htmlRef.trigger(EVENT NAME)`