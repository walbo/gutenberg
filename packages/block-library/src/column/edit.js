/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import {
	InnerBlocks,
	BlockControls,
	BlockVerticalAlignmentToolbar,
	getColorClassName,
	InspectorControls,
	useBlockProps,
	__experimentalUseInnerBlocksProps as useInnerBlocksProps,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import {
	PanelBody,
	__experimentalUnitControl as UnitControl,
} from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { sprintf, __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { CSS_UNITS } from '../columns/utils';

function ColumnEdit( {
	attributes: {
		borderColor,
		style,
		verticalAlignment,
		width,
		templateLock = false,
	},
	setAttributes,
	clientId,
} ) {
	const { columnsIds, hasChildBlocks, rootClientId } = useSelect(
		( select ) => {
			const { getBlockOrder, getBlockRootClientId } = select(
				blockEditorStore
			);

			const rootId = getBlockRootClientId( clientId );

			return {
				hasChildBlocks: getBlockOrder( clientId ).length > 0,
				rootClientId: rootId,
				columnsIds: getBlockOrder( rootId ),
			};
		},
		[ clientId ]
	);

	const { updateBlockAttributes } = useDispatch( blockEditorStore );

	const updateAlignment = ( value ) => {
		// Update own alignment.
		setAttributes( { verticalAlignment: value } );
		// Reset parent Columns block.
		updateBlockAttributes( rootClientId, {
			verticalAlignment: null,
		} );
	};

	const widthWithUnit = Number.isFinite( width ) ? width + '%' : width;

	const columnsCount = columnsIds.length;
	const currentColumnPosition = columnsIds.indexOf( clientId ) + 1;

	const borderColorClass = getColorClassName( 'border-color', borderColor );

	const classes = classnames( 'block-core-columns', borderColorClass, {
		[ `is-vertically-aligned-${ verticalAlignment }` ]: verticalAlignment,
	} );

	// Inner column blocks will only apply the border support provided styles
	// as a right hand border until border support is updated to allow
	// configuration of individual borders.
	//
	// CSS will have to force last column to remove right hand border due to not
	// being able to determine column position within the block's save function.
	const blockProps = useBlockProps( {
		className: classes,
		style: {
			flexBasis: widthWithUnit || undefined,
			borderRightColor:
				( ! borderColorClass && style?.border?.color ) || undefined,
			borderRightStyle: style?.border?.style || undefined,
			borderRightWidth: style?.border?.width || undefined,
			borderBottomColor:
				( ! borderColorClass && style?.border?.color ) || undefined,
			borderBottomStyle: style?.border?.style || undefined,
			borderBottomWidth: style?.border?.width || undefined,
		},
	} );

	const label = sprintf(
		/* translators: 1: Block label (i.e. "Block: Column"), 2: Position of the selected block, 3: Total number of sibling blocks of the same type */
		__( '%1$s (%2$d of %3$d)' ),
		blockProps[ 'aria-label' ],
		currentColumnPosition,
		columnsCount
	);

	const innerBlocksProps = useInnerBlocksProps(
		{ ...blockProps, 'aria-label': label },
		{
			templateLock,
			renderAppender: hasChildBlocks
				? undefined
				: InnerBlocks.ButtonBlockAppender,
		}
	);

	return (
		<>
			<BlockControls>
				<BlockVerticalAlignmentToolbar
					onChange={ updateAlignment }
					value={ verticalAlignment }
				/>
			</BlockControls>
			<InspectorControls>
				<PanelBody title={ __( 'Column settings' ) }>
					<UnitControl
						label={ __( 'Width' ) }
						labelPosition="edge"
						__unstableInputWidth="80px"
						value={ width || '' }
						onChange={ ( nextWidth ) => {
							nextWidth =
								0 > parseFloat( nextWidth ) ? '0' : nextWidth;
							setAttributes( { width: nextWidth } );
						} }
						units={ CSS_UNITS }
					/>
				</PanelBody>
			</InspectorControls>
			<div { ...innerBlocksProps } />
		</>
	);
}

export default ColumnEdit;
