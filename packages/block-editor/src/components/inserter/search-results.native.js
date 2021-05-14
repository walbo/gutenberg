/**
 * External dependencies
 */
import {
	FlatList,
	View,
	TouchableHighlight,
	TouchableWithoutFeedback,
	Text,
	Dimensions,
} from 'react-native';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useState, useEffect } from '@wordpress/element';
import { BottomSheet, InserterButton } from '@wordpress/components';
import { usePreferredColorSchemeStyleBem } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import styles from './style.scss';

const MIN_COL_NUM = 3;

function InserterSearchResults( {
	items,
	onSelect,
	listProps,
	safeAreaBottomInset,
} ) {
	const [ numberOfColumns, setNumberOfColumns ] = useState( MIN_COL_NUM );
	const [ itemWidth, setItemWidth ] = useState();
	const [ maxWidth, setMaxWidth ] = useState();

	useEffect( () => {
		Dimensions.addEventListener( 'change', onLayout );
		return () => {
			Dimensions.removeEventListener( 'change', onLayout );
		};
	}, [] );

	const {
		'inserter-search-results__column': columnStyles,
		'inserter-search-results__row-separator': rowSeparatorStyles,
		'inserter-search-results__list': listStyles,
		'inserter-search-results__no-results-container': noResultsContainerStyle,
		'inserter-search-results__no-results-text-primary': noResultsTextPrimaryStyle,
		'inserter-search-results__no-results-text-secondary': noResultsTextSecondaryStyle,
	} = usePreferredColorSchemeStyleBem( styles );

	function calculateItemWidth() {
		const {
			paddingLeft: itemPaddingLeft,
			paddingRight: itemPaddingRight,
		} = InserterButton.Styles.modalItem;
		const { width } = InserterButton.Styles.modalIconWrapper;
		return width + itemPaddingLeft + itemPaddingRight;
	}

	function onLayout() {
		const sumLeftRightPadding =
			columnStyles.paddingLeft + columnStyles.paddingRight;

		const bottomSheetWidth = BottomSheet.getWidth();
		const containerTotalWidth = bottomSheetWidth - sumLeftRightPadding;
		const itemTotalWidth = calculateItemWidth();

		const columnsFitToWidth = Math.floor(
			containerTotalWidth / itemTotalWidth
		);

		const numColumns = Math.max( MIN_COL_NUM, columnsFitToWidth );

		setNumberOfColumns( numColumns );
		setMaxWidth( containerTotalWidth / numColumns );

		if ( columnsFitToWidth < MIN_COL_NUM ) {
			const updatedItemWidth =
				( bottomSheetWidth - 2 * sumLeftRightPadding ) / MIN_COL_NUM;
			setItemWidth( updatedItemWidth );
		}
	}

	if ( items?.length === 0 ) {
		return (
			<View>
				<View style={ noResultsContainerStyle }>
					<Text style={ noResultsTextPrimaryStyle }>
						{ __( 'No blocks found' ) }
					</Text>
					<Text style={ noResultsTextSecondaryStyle }>
						{ __( 'Try another search term' ) }
					</Text>
				</View>
			</View>
		);
	}

	return (
		<TouchableHighlight accessible={ false }>
			<FlatList
				onLayout={ onLayout }
				key={ `InserterUI-${ numberOfColumns }` } //re-render when numberOfColumns changes
				keyboardShouldPersistTaps="always"
				numColumns={ numberOfColumns }
				data={ items }
				initialNumToRender={ 3 }
				ItemSeparatorComponent={ () => (
					<TouchableWithoutFeedback accessible={ false }>
						<View style={ rowSeparatorStyles } />
					</TouchableWithoutFeedback>
				) }
				keyExtractor={ ( item ) => item.name }
				renderItem={ ( { item } ) => (
					<InserterButton
						{ ...{
							item,
							itemWidth,
							maxWidth,
							onSelect,
						} }
					/>
				) }
				{ ...listProps }
				contentContainerStyle={ [
					...listProps.contentContainerStyle,
					{
						paddingBottom:
							safeAreaBottomInset || listStyles.paddingBottom,
					},
				] }
			/>
		</TouchableHighlight>
	);
}

export default InserterSearchResults;
