/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals ClassicEditor, console, window, document */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

ClassicEditor
	.create( document.querySelector( '#snippet-indent' ), {
		cloudServices: CS_CONFIG,
		toolbar: {
			items: [
				'undo', 'redo', 'heading',
				'|', 'bold', 'italic',
				'|', 'link', 'uploadImage', 'insertTable', 'mediaEmbed',
				'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
			]
		},
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		}
	} )
	.then( editor => {
		window.editor = editor;

		window.attachTourBalloon( {
			target: window.findToolbarItem( editor.ui.view.toolbar, item => item.label && item.label === 'Increase indent' ),
			text: 'Click to indent or outdent a block.',
			editor
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
