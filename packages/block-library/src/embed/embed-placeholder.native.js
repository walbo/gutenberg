/**
 * External dependencies
 */
import { View, Text, TouchableWithoutFeedback } from 'react-native';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { usePreferredColorSchemeStyle } from '@wordpress/compose';
import { Icon } from '@wordpress/components';
import { BlockIcon } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import styles from './styles.scss';
import { noticeOutline } from '../../../components/src/mobile/gridicons';

const EmbedPlaceholder = ( {
	icon,
	isSelected,
	label,
	onPress,
	cannotEmbed,
} ) => {
	const containerStyle = usePreferredColorSchemeStyle(
		styles.embed__container,
		styles[ 'embed__container--dark' ]
	);
	const labelStyle = usePreferredColorSchemeStyle(
		styles.embed__label,
		styles[ 'embed__label--dark' ]
	);
	const descriptionStyle = styles.embed__description;
	const descriptionErrorStyle = styles[ 'embed__description--error' ];
	const actionStyle = usePreferredColorSchemeStyle(
		styles.embed__action,
		styles[ 'embed__action--dark' ]
	);
	const embedIconErrorStyle = styles[ 'embed__icon--error' ];

	return (
		<>
			<TouchableWithoutFeedback
				accessibilityRole={ 'button' }
				accessibilityHint={ __( 'Double tap to add a link.' ) }
				onPress={ onPress }
				disabled={ ! isSelected }
			>
				<View style={ containerStyle }>
					{ cannotEmbed ? (
						<>
							<Icon
								icon={ noticeOutline }
								fill={ embedIconErrorStyle.fill }
								style={ embedIconErrorStyle }
							/>
							<Text
								style={ [
									descriptionStyle,
									descriptionErrorStyle,
								] }
							>
								{ __( 'Unable to embed media' ) }
							</Text>
							<Text style={ actionStyle }>
								{ __( 'EDIT LINK' ) }
							</Text>
						</>
					) : (
						<>
							<BlockIcon icon={ icon } />
							<Text style={ labelStyle }>{ label }</Text>
							<Text style={ actionStyle }>
								{ __( 'ADD LINK' ) }
							</Text>
						</>
					) }
				</View>
			</TouchableWithoutFeedback>
		</>
	);
};

export default EmbedPlaceholder;
