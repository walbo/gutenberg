/**
 * WordPress dependencies
 */
import {
	__experimentalBlockNavigation as BlockNavigation,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';

export default function BlockNavigationList( {
	clientId,
	__experimentalFeatures,
} ) {
	const blocks = useSelect(
		( select ) =>
			select( blockEditorStore ).__unstableGetClientIdsTree( clientId ),
		[ clientId ]
	);

	return (
		<BlockNavigation
			blocks={ blocks }
			showAppender
			showBlockMovers
			showNestedBlocks
			__experimentalFeatures={ __experimentalFeatures }
		/>
	);
}
