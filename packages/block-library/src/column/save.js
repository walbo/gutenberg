/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import {
	getColorClassName,
	InnerBlocks,
	useBlockProps,
} from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { borderColor, style, verticalAlignment, width } = attributes;

	const widthWithUnit = Number.isFinite( width ) ? width + '%' : width;
	const borderColorClass = getColorClassName( 'border-color', borderColor );

	const wrapperClasses = classnames( borderColorClass, {
		[ `is-vertically-aligned-${ verticalAlignment }` ]: verticalAlignment,
	} );

	// Inner column blocks will only apply the border support provided styles
	// as a right hand border until border support is updated to allow
	// configuration of individual borders.
	//
	// CSS will have to force last column to remove right hand border due to not
	// being able to determine column position within the this save function.
	const blockStyles = {
		flexBasis: widthWithUnit || undefined,
		borderRightColor:
			( ! borderColorClass && style?.border?.color ) || undefined,
		borderRightStyle: style?.border?.style || undefined,
		borderRightWidth: style?.border?.width || undefined,
	};

	return (
		<div
			{ ...useBlockProps.save( {
				className: wrapperClasses,
				style: blockStyles,
			} ) }
		>
			<InnerBlocks.Content />
		</div>
	);
}
