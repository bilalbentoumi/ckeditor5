/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting';
import HeadingEditing from '@ckeditor/ckeditor5-heading/src/headingediting';
import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import TableEditing from '@ckeditor/ckeditor5-table/src/tableediting';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

import TodoDocumentListEditing from '../../src/tododocumentlist/tododocumentlistediting';
import DocumentListEditing from '../../src/documentlist/documentlistediting';
import DocumentListCommand from '../../src/documentlist/documentlistcommand';
import CheckTodoDocumentListCommand from '../../src/tododocumentlist/checktododocumentlistcommand';
import TodoCheckboxChangeObserver from '../../src/tododocumentlist/todocheckboxchangeobserver';

import stubUid from '../documentlist/_utils/uid';

describe( 'TodoDocumentListEditing', () => {
	let editor, model, view;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ Paragraph, TodoDocumentListEditing, BlockQuoteEditing, TableEditing, HeadingEditing ]
		} );

		model = editor.model;
		view = editor.editing.view;

		stubUid();
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'should have pluginName', () => {
		expect( TodoDocumentListEditing.pluginName ).to.equal( 'TodoDocumentListEditing' );
	} );

	it( 'should load DocumentListEditing', () => {
		expect( TodoDocumentListEditing.requires ).to.have.members( [ DocumentListEditing ] );
	} );

	describe( 'commands', () => {
		it( 'should register todoList command', () => {
			const command = editor.commands.get( 'todoList' );

			expect( command ).to.be.instanceOf( DocumentListCommand );
			expect( command ).to.have.property( 'type', 'todo' );
		} );

		it( 'should register checkTodoList command', () => {
			const command = editor.commands.get( 'checkTodoList' );

			expect( command ).to.be.instanceOf( CheckTodoDocumentListCommand );
		} );
	} );

	it( 'should register TodoCheckboxChangeObserver', () => {
		expect( view.getObserver( TodoCheckboxChangeObserver ) ).to.be.instanceOf( TodoCheckboxChangeObserver );
	} );

	it( 'should set proper schema rules', () => {
		const paragraph = new ModelElement( 'paragraph', { listItemId: 'foo', listType: 'todo' } );
		const heading = new ModelElement( 'heading1', { listItemId: 'foo', listType: 'todo' } );
		const blockQuote = new ModelElement( 'blockQuote', { listItemId: 'foo', listType: 'todo' } );
		const table = new ModelElement( 'table', { listItemId: 'foo', listType: 'todo' }, [ ] );

		expect( model.schema.checkAttribute( [ '$root', paragraph ], 'todoListChecked' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$root', heading ], 'todoListChecked' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$root', blockQuote ], 'todoListChecked' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$root', table ], 'todoListChecked' ) ).to.be.true;
	} );

	describe( 'upcast', () => {
		it( 'should convert li with a checkbox before the first text node as a to-do list item', () => {
			testUpcast(
				'<ul><li><input type="checkbox">foo</li></ul>',
				'<paragraph listIndent="0" listItemId="a00" listType="todo">foo</paragraph>'
			);
		} );

		it( 'should convert the full markup generated by the editor', () => {
			testUpcast(
				'<ul><li><input type="checkbox">foo</li></ul>',
				'<paragraph listIndent="0" listItemId="a00" listType="todo">foo</paragraph>'
			);

			testUpcast(
				editor.getData(),
				'<paragraph listIndent="0" listItemId="a01" listType="todo">foo</paragraph>'
			);
		} );

		it( 'should convert li with checked checkbox as checked to-do list item', () => {
			testUpcast(
				'<ul>' +
					'<li><input type="checkbox" checked="checked">a</li>' +
					'<li><input type="checkbox" checked="anything">b</li>' +
					'<li><input type="checkbox" checked>c</li>' +
				'</ul>',
				'<paragraph listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">a</paragraph>' +
				'<paragraph listIndent="0" listItemId="a01" listType="todo" todoListChecked="true">b</paragraph>' +
				'<paragraph listIndent="0" listItemId="a02" listType="todo" todoListChecked="true">c</paragraph>'
			);
		} );

		it( 'should not convert li with checkbox in the middle of the text', () => {
			testUpcast(
				'<ul><li>Foo<input type="checkbox">Bar</li></ul>',
				'<paragraph listIndent="0" listItemId="a00" listType="bulleted">FooBar</paragraph>'
			);
		} );

		it( 'should split items with checkboxes - bulleted list', () => {
			testUpcast(
				'<ul>' +
					'<li>foo</li>' +
					'<li><input type="checkbox">bar</li>' +
					'<li>baz</li>' +
				'</ul>',
				'<paragraph listIndent="0" listItemId="a00" listType="bulleted">foo</paragraph>' +
				'<paragraph listIndent="0" listItemId="a01" listType="todo">bar</paragraph>' +
				'<paragraph listIndent="0" listItemId="a02" listType="bulleted">baz</paragraph>'
			);
		} );

		it( 'should split items with checkboxes - numbered list', () => {
			testUpcast(
				'<ol>' +
					'<li>foo</li>' +
					'<li><input type="checkbox">bar</li>' +
					'<li>baz</li>' +
				'</ol>',
				'<paragraph listIndent="0" listItemId="a00" listType="numbered">foo</paragraph>' +
				'<paragraph listIndent="0" listItemId="a01" listType="todo">bar</paragraph>' +
				'<paragraph listIndent="0" listItemId="a02" listType="numbered">baz</paragraph>'
			);
		} );

		it( 'should convert li with a checkbox in a nested list', () => {
			testUpcast(
				'<ul>' +
					'<li>' +
						'<input type="checkbox">' +
						'foo' +
						'<ul><li><input type="checkbox">foo</li></ul>' +
					'</li>' +
				'</ul>',
				'<paragraph listIndent="0" listItemId="a01" listType="todo">foo</paragraph>' +
				'<paragraph listIndent="1" listItemId="a00" listType="todo">foo</paragraph>'
			);
		} );

		it( 'should convert li with checkboxes in a nested lists (bulleted > todo > todo)', () => {
			testUpcast(
				'<ul>' +
					'<li>' +
						'<ul>' +
							'<li>' +
								'<input type="checkbox">foo</li>' +
								'<ul><li><input type="checkbox">foo</li></ul>' +
							'</ul>' +
					'</li>' +
				'</ul>',
				'<paragraph listIndent="0" listItemId="a02" listType="bulleted"></paragraph>' +
				'<paragraph listIndent="1" listItemId="a00" listType="todo">foo</paragraph>' +
				'<paragraph listIndent="2" listItemId="a01" listType="todo">foo</paragraph>'
			);
		} );

		it( 'should convert li with a checkbox and a paragraph', () => {
			testUpcast(
				'<ul>' +
					'<li>' +
						'<input type="checkbox">' +
						'<p>foo</p>' +
					'</li>' +
				'</ul>',
				'<paragraph listIndent="0" listItemId="a00" listType="todo">foo</paragraph>'
			);
		} );

		it( 'should convert li with a checkbox and two paragraphs', () => {
			testUpcast(
				'<ul>' +
					'<li>' +
						'<input type="checkbox">' +
						'<p>foo</p>' +
						'<p>bar</p>' +
					'</li>' +
				'</ul>',
				'<paragraph listIndent="0" listItemId="a00" listType="todo">foo</paragraph>' +
				'<paragraph listIndent="0" listItemId="a00" listType="todo">bar</paragraph>'
			);
		} );

		it( 'should convert li with a checkbox and a blockquote', () => {
			testUpcast(
				'<ul>' +
					'<li>' +
						'<input type="checkbox">' +
						'<blockquote>foo</blockquote>' +
					'</li>' +
				'</ul>',
				'<blockQuote listIndent="0" listItemId="a00" listType="todo">' +
					'<paragraph>foo</paragraph>' +
				'</blockQuote>'
			);
		} );

		it( 'should convert li with a checkbox and a heading', () => {
			testUpcast(
				'<ul>' +
					'<li>' +
						'<input type="checkbox">' +
						'<h2>foo</h2>' +
					'</li>' +
				'</ul>',
				'<heading1 listIndent="0" listItemId="a00" listType="todo">foo</heading1>'
			);
		} );

		it( 'should convert li with a checkbox and a table', () => {
			testUpcast(
				'<ul>' +
					'<li>' +
						'<input type="checkbox">' +
						'<table><tr><td>foo</td></tr></table>' +
					'</li>' +
				'</ul>',
				'<table listIndent="0" listItemId="a00" listType="todo">' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>foo</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>'
			);
		} );
	} );

	describe( 'downcast - editing', () => {
		it( 'should convert a todo list item', () => {
			testEditing(
				'<paragraph listIndent="0" listItemId="a00" listType="todo">foo</paragraph>',
				'<ul class="todo-list">' +
					'<li>' +
						'<span class="todo-list__label">' +
							'<span contenteditable="false">' +
								'<input tabindex="-1" type="checkbox"></input>' +
							'</span>' +
							'<span class="todo-list__label__description">' +
								'foo' +
							'</span>' +
						'</span>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should convert a nested todo list item', () => {
			testEditing(
				'<paragraph listIndent="0" listItemId="a01" listType="todo">foo</paragraph>' +
				'<paragraph listIndent="1" listItemId="a00" listType="todo">foo</paragraph>',
				'<ul class="todo-list">' +
					'<li>' +
						'<span class="todo-list__label">' +
							'<span contenteditable="false">' +
								'<input tabindex="-1" type="checkbox"></input>' +
							'</span>' +
							'<span class="todo-list__label__description">' +
								'foo' +
							'</span>' +
						'</span>' +
						'<ul class="todo-list">' +
							'<li>' +
								'<span class="todo-list__label">' +
									'<span contenteditable="false">' +
										'<input tabindex="-1" type="checkbox"></input>' +
									'</span>' +
									'<span class="todo-list__label__description">' +
										'foo' +
									'</span>' +
								'</span>' +
							'</li>' +
						'</ul>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should convert to-do list item mixed with bulleted list items', () => {
			testEditing(
				'<paragraph listIndent="0" listItemId="a00" listType="bulleted">foo</paragraph>' +
				'<paragraph listIndent="0" listItemId="a01" listType="todo">bar</paragraph>' +
				'<paragraph listIndent="0" listItemId="a02" listType="bulleted">baz</paragraph>',
				'<ul>' +
					'<li>' +
						'<span class="ck-list-bogus-paragraph">foo</span>' +
					'</li>' +
				'</ul>' +
				'<ul class="todo-list">' +
					'<li>' +
						'<span class="todo-list__label">' +
							'<span contenteditable="false">' +
								'<input tabindex="-1" type="checkbox"></input>' +
							'</span>' +
							'<span class="todo-list__label__description">bar</span>' +
						'</span>' +
					'</li>' +
				'</ul>' +
				'<ul>' +
					'<li><span class="ck-list-bogus-paragraph">baz</span></li>' +
				'</ul>'
			);
		} );

		it( 'should convert to-do list item mixed with numbered list items', () => {
			testEditing(
				'<paragraph listIndent="0" listItemId="a00" listType="numbered">foo</paragraph>' +
				'<paragraph listIndent="0" listItemId="a01" listType="todo">bar</paragraph>' +
				'<paragraph listIndent="0" listItemId="a02" listType="numbered">baz</paragraph>',
				'<ol>' +
					'<li>' +
						'<span class="ck-list-bogus-paragraph">foo</span>' +
					'</li>' +
				'</ol>' +
				'<ul class="todo-list">' +
					'<li>' +
						'<span class="todo-list__label">' +
							'<span contenteditable="false">' +
								'<input tabindex="-1" type="checkbox"></input>' +
							'</span>' +
							'<span class="todo-list__label__description">bar</span>' +
						'</span>' +
					'</li>' +
				'</ul>' +
				'<ol>' +
					'<li><span class="ck-list-bogus-paragraph">baz</span></li>' +
				'</ol>'
			);
		} );

		it( 'should wrap a checkbox and first paragraph in a span with a special label class', () => {
			testEditing(
				'<paragraph listIndent="0" listItemId="a00" listType="todo">foo</paragraph>' +
				'<paragraph listIndent="0" listItemId="a00" listType="todo">bar</paragraph>',
				'<ul class="todo-list">' +
					'<li>' +
						'<span class="todo-list__label">' +
							'<span contenteditable="false">' +
								'<input tabindex="-1" type="checkbox"></input>' +
							'</span>' +
							'<span class="todo-list__label__description">' +
								'foo' +
							'</span>' +
						'</span>' +
						'<p>bar</p>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should wrap only a checkbox in a span if first element is a blockquote', () => {
			testEditing(
				'<blockQuote listIndent="0" listItemId="a00" listType="todo">' +
					'<paragraph>foo</paragraph>' +
				'</blockQuote>',
				'<ul class="todo-list">' +
					'<li>' +
						'<span class="todo-list__label todo-list__label_without-description">' +
							'<span contenteditable="false">' +
								'<input tabindex="-1" type="checkbox"></input>' +
							'</span>' +
						'</span>' +
						'<blockquote>' +
							'<p>foo</p>' +
						'</blockquote>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should wrap only a checkbox in a span if first element is a heading', () => {
			testEditing(
				'<heading1 listIndent="0" listItemId="a00" listType="todo">foo</heading1>',
				'<ul class="todo-list">' +
					'<li>' +
						'<span class="todo-list__label todo-list__label_without-description">' +
							'<span contenteditable="false">' +
								'<input tabindex="-1" type="checkbox"></input>' +
							'</span>' +
						'</span>' +
						'<h2>foo</h2>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should wrap only a checkbox in a span if first element is a table', () => {
			testEditing(
				'<table listIndent="0" listItemId="a00" listType="todo">' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>foo</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>',
				'<ul class="todo-list">' +
					'<li>' +
						'<span class="todo-list__label todo-list__label_without-description">' +
							'<span contenteditable="false">' +
								'<input tabindex="-1" type="checkbox"></input>' +
							'</span>' +
						'</span>' +
						'<figure class="ck-widget ck-widget_with-selection-handle table" contenteditable="false">' +
							'<div class="ck ck-widget__selection-handle"></div>' +
							'<table>' +
								'<tbody>' +
									'<tr>' +
										'<td class="ck-editor__editable ck-editor__nested-editable" ' +
											'contenteditable="true" role="textbox">' +
											'<span class="ck-table-bogus-paragraph">foo</span>' +
										'</td>' +
									'</tr>' +
								'</tbody>' +
							'</table>' +
						'</figure>' +
					'</li>' +
				'</ul>'
			);
		} );
	} );

	describe( 'downcast - data', () => {
		it( 'should convert a todo list item', () => {
			testData(
				'<paragraph listIndent="0" listItemId="a00" listType="todo">foo</paragraph>',
				'<ul class="todo-list">' +
					'<li>' +
						'<label class="todo-list__label">' +
							'<input type="checkbox" disabled="disabled">' +
							'<span class="todo-list__label__description">foo</span>' +
						'</label>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should convert a nested todo list item', () => {
			testData(
				'<paragraph listIndent="0" listItemId="a01" listType="todo">foo</paragraph>' +
				'<paragraph listIndent="1" listItemId="a00" listType="todo">foo</paragraph>',
				'<ul class="todo-list">' +
					'<li>' +
						'<label class="todo-list__label">' +
							'<input type="checkbox" disabled="disabled">' +
							'<span class="todo-list__label__description">foo</span>' +
						'</label>' +
						'<ul class="todo-list">' +
							'<li>' +
								'<label class="todo-list__label">' +
									'<input type="checkbox" disabled="disabled">' +
										'<span class="todo-list__label__description">' +
											'foo' +
										'</span>' +
									'</label>' +
								'</li>' +
						'</ul>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should convert to-do list item mixed with bulleted list items', () => {
			testData(
				'<paragraph listIndent="0" listItemId="a00" listType="bulleted">foo</paragraph>' +
				'<paragraph listIndent="0" listItemId="a01" listType="todo">bar</paragraph>' +
				'<paragraph listIndent="0" listItemId="a02" listType="bulleted">baz</paragraph>',
				'<ul>' +
					'<li>foo</li>' +
				'</ul>' +
				'<ul class="todo-list">' +
					'<li>' +
						'<label class="todo-list__label">' +
							'<input type="checkbox" disabled="disabled">' +
							'<span class="todo-list__label__description">bar</span>' +
						'</label>' +
					'</li>' +
				'</ul>' +
				'<ul>' +
					'<li>baz</li>' +
				'</ul>'
			);
		} );

		it( 'should convert to-do list item mixed with numbered list items', () => {
			testData(
				'<paragraph listIndent="0" listItemId="a00" listType="numbered">foo</paragraph>' +
				'<paragraph listIndent="0" listItemId="a01" listType="todo">bar</paragraph>' +
				'<paragraph listIndent="0" listItemId="a02" listType="numbered">baz</paragraph>',
				'<ol>' +
					'<li>foo</li>' +
				'</ol>' +
				'<ul class="todo-list">' +
					'<li>' +
						'<label class="todo-list__label">' +
							'<input type="checkbox" disabled="disabled">' +
							'<span class="todo-list__label__description">bar</span>' +
						'</label>' +
					'</li>' +
				'</ul>' +
				'<ol>' +
					'<li>baz</li>' +
				'</ol>'
			);
		} );

		it( 'should wrap a checkbox and first paragraph in a label element', () => {
			testData(
				'<paragraph listIndent="0" listItemId="a00" listType="todo">foo</paragraph>' +
				'<paragraph listIndent="0" listItemId="a00" listType="todo">bar</paragraph>',
				'<ul class="todo-list">' +
					'<li>' +
						'<label class="todo-list__label">' +
							'<input type="checkbox" disabled="disabled">' +
							'<span class="todo-list__label__description">foo</span>' +
						'</label>' +
						'<p>bar</p>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should wrap only a checkbox in a label element if first element is a blockquote', () => {
			testData(
				'<blockQuote listIndent="0" listItemId="a00" listType="todo">' +
					'<paragraph>foo</paragraph>' +
				'</blockQuote>',
				'<ul class="todo-list">' +
					'<li>' +
						'<label class="todo-list__label todo-list__label_without-description">' +
							'<input type="checkbox" disabled="disabled">' +
						'</label>' +
						'<blockquote><p>foo</p></blockquote>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should wrap only a checkbox in a label element if first element is a heading', () => {
			testData(
				'<heading1 listIndent="0" listItemId="a00" listType="todo">foo</heading1>',
				'<ul class="todo-list">' +
					'<li>' +
						'<label class="todo-list__label todo-list__label_without-description">' +
							'<input type="checkbox" disabled="disabled">' +
						'</label>' +
						'<h2>foo</h2>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should wrap only a checkbox in a label element if first element is a table', () => {
			testData(
				'<table listIndent="0" listItemId="a00" listType="todo">' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>foo</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>',
				'<ul class="todo-list">' +
					'<li>' +
						'<label class="todo-list__label todo-list__label_without-description">' +
							'<input type="checkbox" disabled="disabled">' +
						'</label>' +
						'<figure class="table">' +
							'<table>' +
								'<tbody>' +
									'<tr>' +
										'<td>foo</td>' +
									'</tr>' +
								'</tbody>' +
							'</table>' +
						'</figure>' +
					'</li>' +
				'</ul>'
			);
		} );
	} );

	function testUpcast( input, output ) {
		editor.setData( input );
		expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( output );
	}

	function testEditing( input, output ) {
		setModelData( model, input );
		expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup( output );
	}

	function testData( input, output ) {
		setModelData( model, input );
		expect( editor.getData() ).to.equalMarkup( output );
	}
} );
