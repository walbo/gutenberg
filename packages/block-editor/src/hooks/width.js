/**
 * WordPress dependencies
 */
import { getBlockSupport } from '@wordpress/blocks';
import {
	__experimentalUseCustomUnits as useCustomUnits,
	__experimentalUnitControl as UnitControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import useSetting from '../components/use-setting';
import { DIMENSIONS_SUPPORT_KEY } from './dimensions';
import { cleanEmptyObject } from './utils';

/**
 * Determines if there is width support.
 *
 * @param  {string|Object} blockType Block name or Block Type object.
 * @return {boolean}                 Whether there is support.
 */
export function hasWidthSupport( blockType ) {
	const support = getBlockSupport( blockType, DIMENSIONS_SUPPORT_KEY );
	return !! ( true === support || support?.width );
}

/**
 * Checks if there is a current value in the width block support attributes.
 *
 * @param  {Object} props Block props.
 * @return {boolean}      Whether or not the block has a width value set.
 */
export function hasWidthValue( props ) {
	return props.attributes.style?.dimensions?.width !== undefined;
}

/**
 * Resets the width block support attributes. This can be used when
 * disabling the width support controls for a block via a progressive
 * discovery panel.
 *
 * @param {Object} props               Block props.
 * @param {Object} props.attributes    Block's attributes.
 * @param {Object} props.setAttributes Function to set block's attributes.
 */
export function resetWidth( { attributes = {}, setAttributes } ) {
	const { style } = attributes;

	setAttributes( {
		style: {
			...style,
			dimensions: {
				...style?.dimensions,
				width: undefined,
			},
		},
	} );
}

/**
 * Custom hook that checks if width controls have been disabled.
 *
 * @param  {string} name The name of the block.
 * @return {boolean}     Whether width control is disabled.
 */
export function useIsWidthDisabled( { name: blockName } = {} ) {
	const isDisabled = ! useSetting( 'dimensions.customWidth' );
	return ! hasWidthSupport( blockName ) || isDisabled;
}

/**
 * Inspector control panel containing the width related configuration.
 *
 * @param  {Object} props Block props.
 * @return {WPElement}    Edit component for width.
 */
export function WidthEdit( props ) {
	const {
		attributes: { style },
		setAttributes,
	} = props;

	const units = useCustomUnits( {
		availableUnits: useSetting( 'dimensions.units' ) || [
			'%',
			'px',
			'em',
			'rem',
			'vh',
			'vw',
		],
	} );

	if ( useIsWidthDisabled( props ) ) {
		return null;
	}

	const onChange = ( next ) => {
		const newStyle = {
			...style,
			dimensions: {
				...style?.dimensions,
				width: next,
			},
		};

		setAttributes( { style: cleanEmptyObject( newStyle ) } );
	};

	return (
		<UnitControl
			label={ __( 'Width' ) }
			value={ style?.dimensions?.width }
			units={ units }
			onChange={ onChange }
			min={ 0 }
		/>
	);
}
