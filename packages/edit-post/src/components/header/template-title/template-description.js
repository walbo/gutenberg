/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';
import { __experimentalText as Text } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { store as editPostStore } from '../../../store';

export default function TemplateDescription() {
	const { description } = useSelect( ( select ) => {
		const { getEditedPostTemplate } = select( editPostStore );
		return {
			description: getEditedPostTemplate().description,
		};
	}, [] );
	return !! description && <Text size="body">{ description }</Text>;
}
