/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document, console */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ImageInsert from '../../src/imageinsert';
import AutoImage from '../../src/autoimage';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import ImageStyle from '../../src/imagestyle';
import ImageToolbar from '../../src/imagetoolbar';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import ImageInline from '../../src/imageinline';
import CKFinder from '@ckeditor/ckeditor5-ckfinder/src/ckfinder';
import CKFinderUploadAdapter from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			Essentials,
			Autoformat,
			BlockQuote,
			Bold,
			Heading,
			ImageInline,
			ImageStyle,
			ImageToolbar,
			Indent,
			Italic,
			Link,
			List,
			MediaEmbed,
			Paragraph,
			Table,
			TableToolbar,
			ImageInsert,
			CKFinder,
			CKFinderUploadAdapter,
			AutoImage
		],
		toolbar: [
			'heading',
			'|',
			'bold',
			'italic',
			'link',
			'bulletedList',
			'numberedList',
			'blockQuote',
			'imageInsert',
			'insertTable',
			'mediaEmbed',
			'undo',
			'redo'
		],
		image: {
			toolbar: [ 'imageStyle:inline', 'imageStyle:wrapText', '|', 'imageTextAlternative' ]
		},
		ckfinder: {
			// eslint-disable-next-line max-len
			uploadUrl: 'https://ckeditor.com/apps/ckfinder/3.5.0/core/connector/php/connector.php?command=QuickUpload&type=Files&responseType=json'
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
