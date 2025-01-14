/**
 * Internal dependencies
 */
import { VisuallyHidden } from '../visually-hidden';
import { Label as BaseLabel } from './styles/input-control-styles';
import type { PolymorphicComponentProps } from '../ui/context';
import type { InputControlLabelProps } from './types';

export default function Label( {
	children,
	hideLabelFromVision,
	htmlFor,
	...props
}: PolymorphicComponentProps< InputControlLabelProps, 'label', false > ) {
	if ( ! children ) return null;

	if ( hideLabelFromVision ) {
		return (
			<VisuallyHidden as="label" htmlFor={ htmlFor }>
				{ children }
			</VisuallyHidden>
		);
	}

	return (
		<BaseLabel htmlFor={ htmlFor } { ...props }>
			{ children }
		</BaseLabel>
	);
}
