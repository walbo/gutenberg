/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useEffect, useRef, useState } from '@wordpress/element';
import { decodeEntities } from '@wordpress/html-entities';
import { ENTER } from '@wordpress/keycodes';
import { useSelect, useDispatch } from '@wordpress/data';
import { pasteHandler } from '@wordpress/blocks';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { __unstableUseRichText as useRichText } from '@wordpress/rich-text';
import { useMergeRefs } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import PostTypeSupportCheck from '../post-type-support-check';
import { store as editorStore } from '../../store';

/**
 * Constants
 */
const REGEXP_NEWLINES = /[\r\n]+/g;

export default function PostTitle() {
	const ref = useRef();
	const [ isSelected, setIsSelected ] = useState( false );
	const { editPost } = useDispatch( editorStore );
	const {
		insertDefaultBlock,
		clearSelectedBlock,
		insertBlocks,
	} = useDispatch( blockEditorStore );
	const {
		isCleanNewPost,
		title,
		placeholder,
		isFocusMode,
		hasFixedToolbar,
	} = useSelect( ( select ) => {
		const {
			getEditedPostAttribute,
			isCleanNewPost: _isCleanNewPost,
		} = select( editorStore );
		const { getSettings } = select( blockEditorStore );
		const {
			titlePlaceholder,
			focusMode,
			hasFixedToolbar: _hasFixedToolbar,
		} = getSettings();

		return {
			isCleanNewPost: _isCleanNewPost(),
			title: getEditedPostAttribute( 'title' ),
			placeholder: titlePlaceholder,
			isFocusMode: focusMode,
			hasFixedToolbar: _hasFixedToolbar,
		};
	} );

	useEffect( () => {
		if ( ! ref.current ) {
			return;
		}

		const { ownerDocument } = ref.current;
		const { activeElement, body } = ownerDocument;

		// Only autofocus the title when the post is entirely empty. This should
		// only happen for a new post, which means we focus the title on new
		// post so the author can start typing right away, without needing to
		// click anything.
		if ( isCleanNewPost && ( ! activeElement || body === activeElement ) ) {
			ref.current.focus();
		}
	}, [ isCleanNewPost ] );

	function onEnterPress() {
		insertDefaultBlock( undefined, undefined, 0 );
	}

	function onInsertBlockAfter( blocks ) {
		insertBlocks( blocks, 0 );
	}

	function onUpdate( newTitle ) {
		editPost( { title: newTitle } );
	}

	const [ selection, setSelection ] = useState( {} );

	function onSelect() {
		setIsSelected( true );
		clearSelectedBlock();
	}

	function onUnselect() {
		setIsSelected( false );
		setSelection( {} );
	}

	function onChange( value ) {
		onUpdate( value.replace( REGEXP_NEWLINES, ' ' ) );
	}

	function onKeyDown( event ) {
		if ( event.keyCode === ENTER ) {
			event.preventDefault();
			onEnterPress();
		}
	}

	function onPaste( event ) {
		const clipboardData = event.clipboardData;

		let plainText = '';
		let html = '';

		// IE11 only supports `Text` as an argument for `getData` and will
		// otherwise throw an invalid argument error, so we try the standard
		// arguments first, then fallback to `Text` if they fail.
		try {
			plainText = clipboardData.getData( 'text/plain' );
			html = clipboardData.getData( 'text/html' );
		} catch ( error1 ) {
			try {
				html = clipboardData.getData( 'Text' );
			} catch ( error2 ) {
				// Some browsers like UC Browser paste plain text by default and
				// don't support clipboardData at all, so allow default
				// behaviour.
				return;
			}
		}

		// Allows us to ask for this information when we get a report.
		window.console.log( 'Received HTML:\n\n', html );
		window.console.log( 'Received plain text:\n\n', plainText );

		const content = pasteHandler( {
			HTML: html,
			plainText,
		} );

		if ( typeof content !== 'string' && content.length ) {
			event.preventDefault();

			const [ firstBlock ] = content;

			if (
				! title &&
				( firstBlock.name === 'core/heading' ||
					firstBlock.name === 'core/paragraph' )
			) {
				onUpdate( firstBlock.attributes.content );
				onInsertBlockAfter( content.slice( 1 ) );
			} else {
				onInsertBlockAfter( content );
			}
		}
	}

	// The wp-block className is important for editor styles.
	// This same block is used in both the visual and the code editor.
	const className = classnames(
		'wp-block editor-post-title editor-post-title__block editor-post-title__input rich-text',
		{
			'is-selected': isSelected,
			'is-focus-mode': isFocusMode,
			'has-fixed-toolbar': hasFixedToolbar,
		}
	);
	const decodedPlaceholder =
		decodeEntities( placeholder ) || __( 'Add title' );
	const { ref: richTextRef } = useRichText( {
		value: title,
		onChange,
		placeholder: decodedPlaceholder,
		selectionStart: selection.start,
		selectionEnd: selection.end,
		onSelectionChange( newStart, newEnd ) {
			setSelection( ( sel ) => {
				const { start, end } = sel;
				if ( start === newStart && end === newEnd ) {
					return sel;
				}
				return {
					start: newStart,
					end: newEnd,
				};
			} );
		},
		__unstableDisableFormats: true,
		preserveWhiteSpace: true,
	} );

	/* eslint-disable jsx-a11y/heading-has-content, jsx-a11y/no-noninteractive-element-interactions */
	return (
		<PostTypeSupportCheck supportKeys="title">
			<h1
				ref={ useMergeRefs( [ richTextRef, ref ] ) }
				contentEditable
				className={ className }
				aria-label={ decodedPlaceholder }
				onFocus={ onSelect }
				onBlur={ onUnselect }
				onKeyDown={ onKeyDown }
				onKeyPress={ onUnselect }
				onPaste={ onPaste }
			/>
		</PostTypeSupportCheck>
	);
	/* eslint-enable jsx-a11y/heading-has-content, jsx-a11y/no-noninteractive-element-interactions */
}
