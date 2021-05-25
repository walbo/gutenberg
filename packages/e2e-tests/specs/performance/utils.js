/**
 * External dependencies
 */
import { existsSync, readFileSync, unlinkSync } from 'fs';

export function readFile( filePath ) {
	return existsSync( filePath )
		? readFileSync( filePath, 'utf8' ).trim()
		: '';
}

export function deleteFile( filePath ) {
	if ( existsSync( filePath ) ) {
		unlinkSync( filePath );
	}
}

function isKeyEvent( item ) {
	return (
		item.cat === 'devtools.timeline' &&
		item.name === 'EventDispatch' &&
		item.dur &&
		item.args &&
		item.args.data
	);
}

function isKeyDownEvent( item ) {
	return isKeyEvent( item ) && item.args.data.type === 'keydown';
}

function isKeyPressEvent( item ) {
	return isKeyEvent( item ) && item.args.data.type === 'keypress';
}

function isKeyUpEvent( item ) {
	return isKeyEvent( item ) && item.args.data.type === 'keyup';
}

function isFocusEvent( item ) {
	return isKeyEvent( item ) && item.args.data.type === 'focus';
}

function isClickEvent( item ) {
	return isKeyEvent( item ) && item.args.data.type === 'click';
}

function isMouseOverEvent( item ) {
	return isKeyEvent( item ) && item.args.data.type === 'mouseover';
}

function isMouseOutEvent( item ) {
	return isKeyEvent( item ) && item.args.data.type === 'mouseout';
}

function getEventDurationsForType( trace, filterFunction ) {
	return trace.traceEvents
		.filter( filterFunction )
		.map( ( item ) => item.dur / 1000 );
}

export function getTypingEventDurations( trace ) {
	return [
		getEventDurationsForType( trace, isKeyDownEvent ),
		getEventDurationsForType( trace, isKeyPressEvent ),
		getEventDurationsForType( trace, isKeyUpEvent ),
	];
}

export function getSelectionEventDurations( trace ) {
	return [ getEventDurationsForType( trace, isFocusEvent ) ];
}

export function getClickEventDurations( trace ) {
	return [ getEventDurationsForType( trace, isClickEvent ) ];
}

export function getHoverEventDurations( trace ) {
	return [
		getEventDurationsForType( trace, isMouseOverEvent ),
		getEventDurationsForType( trace, isMouseOutEvent ),
	];
}

export function getLoadTimestamps( { traceEvents }, url ) {
	const timestamps = {};
	let item;
	let requestStart;
	let requestEnd;
	let frame;

	while ( ( item = traceEvents.shift() ) ) {
		const { name, ts: timestampInMicroseconds, args } = item;

		if ( requestEnd ) {
			// The frame could be an iframe as well.
			if ( args.frame === frame ) {
				const relativeTimeInMiliseconds =
					( timestampInMicroseconds - requestEnd ) / 1000;

				if ( name === 'firstPaint' ) {
					timestamps.firstPaint = relativeTimeInMiliseconds;
				} else if ( name === 'firstContentfulPaint' ) {
					timestamps.firstContentfulPaint = relativeTimeInMiliseconds;
				} else if ( name === 'domContentLoadedEventEnd' ) {
					timestamps.domContentLoaded = relativeTimeInMiliseconds;
				}
			}
		} else if ( requestStart && name === 'ResourceReceiveResponse' ) {
			// Store the time at which the page has been received from the
			// server. We'll base our relative time on this.
			requestEnd = timestampInMicroseconds;
			frame = args.data.frame;
		} else if ( name === 'ResourceSendRequest' && args.data.url === url ) {
			// Mark that the request has started.
			requestStart = true;
		}
	}

	return timestamps;
}
