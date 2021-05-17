/**
 * WordPress dependencies
 */
import deprecated from '@wordpress/deprecated';

/**
 * Internal dependencies
 */
import BlockNavigation from './';

export default function BlockNavigationTree( props ) {
	deprecated( '__experimentalBlockNavigationTree', {
		alternative: '__experimentalBlockNavigation',
	} );

	return <BlockNavigation { ...props } />;
}
