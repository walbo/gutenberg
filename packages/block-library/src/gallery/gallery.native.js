/**
 * External dependencies
 */
import { View } from 'react-native';
import { isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import { defaultColumnsNumber } from './shared';
import styles from './gallery-styles.scss';

/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import {
	BlockCaption,
	__experimentalUseInnerBlocksProps as useInnerBlocksProps,
} from '@wordpress/block-editor';
import { useState, useEffect } from '@wordpress/element';
import { mediaUploadSync } from '@wordpress/react-native-bridge';
import { WIDE_ALIGNMENTS } from '@wordpress/components';
import { useResizeObserver } from '@wordpress/compose';

const TILE_SPACING = 8;

// we must limit displayed columns since readable content max-width is 580px
const MAX_DISPLAYED_COLUMNS = 4;
const MAX_DISPLAYED_COLUMNS_NARROW = 2;

export const Gallery = ( props ) => {
	const [ isCaptionSelected, setIsCaptionSelected ] = useState( false );
	const [ resizeObserver, sizes ] = useResizeObserver();
	const [ maxWidth, setMaxWidth ] = useState( 0 );
	useEffect( mediaUploadSync, [] );

	const {
		mediaPlaceholder,
		attributes,
		isNarrow,
		onBlur,
		insertBlocksAfter,
		clientId,
	} = props;

	useEffect( () => {
		const { width } = sizes || {};
		if ( width ) {
			setMaxWidth( width );
		}
	}, [ sizes ] );

	const {
		images,
		align,
		columns = defaultColumnsNumber( images.length ),
	} = attributes;

	const displayedColumns = Math.min(
		columns,
		isNarrow ? MAX_DISPLAYED_COLUMNS_NARROW : MAX_DISPLAYED_COLUMNS
	);

	const innerBlocksProps = useInnerBlocksProps(
		{},
		{
			contentResizeMode: 'stretch',
			allowedBlocks: [ 'core/image' ],
			orientation: 'horizontal',
			renderAppender: false,
			numColumns: displayedColumns,
			marginHorizontal: TILE_SPACING,
			marginVertical: TILE_SPACING,
			__experimentalLayout: { type: 'default', alignments: [] },
			gridProperties: {
				numColumns: displayedColumns,
			},
			parentWidth: maxWidth + 2 * TILE_SPACING,
		}
	);

	const focusGalleryCaption = () => {
		if ( ! isCaptionSelected ) {
			setIsCaptionSelected( true );
		}
	};

	const isFullWidth = align === WIDE_ALIGNMENTS.alignments.full;

	return (
		<View style={ isFullWidth && styles.fullWidth }>
			{ resizeObserver }
			<View { ...innerBlocksProps } />
			<View
				style={ [
					isFullWidth && styles.fullWidth,
					styles.galleryAppender,
				] }
			>
				{ mediaPlaceholder }
			</View>
			<BlockCaption
				clientId={ clientId }
				isSelected={ isCaptionSelected }
				accessible={ true }
				accessibilityLabelCreator={ ( caption ) =>
					isEmpty( caption )
						? /* translators: accessibility text. Empty gallery caption. */

						  'Gallery caption. Empty'
						: sprintf(
								/* translators: accessibility text. %s: gallery caption. */
								__( 'Gallery caption. %s' ),
								caption
						  )
				}
				onFocus={ focusGalleryCaption }
				onBlur={ onBlur } // always assign onBlur as props
				insertBlocksAfter={ insertBlocksAfter }
			/>
		</View>
	);
};

export default Gallery;
