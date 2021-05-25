/**
 * External dependencies
 */
import { noop } from 'lodash';
import useResizeAware from 'react-resize-aware';

/**
 * Internal dependencies
 */
// TODO: use the version from `@wordpress/compose`
import { useIsomorphicLayoutEffect } from '../ui/utils';

export function usePopoverResizeUpdater( { onResize = noop } ) {
	const [ resizeListener, sizes ] = useResizeAware();

	useIsomorphicLayoutEffect( () => {
		onResize();
	}, [ sizes.width, sizes.height ] );

	return resizeListener;
}
