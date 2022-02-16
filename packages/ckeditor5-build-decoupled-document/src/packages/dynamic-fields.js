import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Model from '@ckeditor/ckeditor5-ui/src/model';

import { createDropdown, addListToDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';

import { add } from '@ckeditor/ckeditor5-utils/src/translation-service';

export default class DynamicFields extends Plugin {

	static get pluginName() {
		return 'DynamicFields';
	}

	init() {

		const editor = this.editor;
		const t = this.editor.t;

		let options = editor.config.get('dynamicFields.options');

		add('fr', {
			'Dynamic Fields': 'Valuers dynamiques',
			'No result': 'Pas de résultat',
			'Search': 'Recherche',
		});

		editor.ui.componentFactory.add('dynamicFields', locale => {

			const dropdownView = createDropdown(locale);

			dropdownView.buttonView.set({
				label: t('Dynamic Fields'),
				withText: true,
				tooltip: true
			});

			dropdownView.extendTemplate({
				attributes: {
					class: [
						'ck-dynamic-fields-dropdown'
					]
				}
			});

			const items = new Collection();

			for (let field of options.fields) {
				items.add({
					type: 'button',
					model: new Model({
						key: field.key,
						label: field.label,
						withText: true
					})
				});
			}

			dropdownView.on('execute', (eventInfo) => {

				const { key } = eventInfo.source;

				editor.model.change( writer => {
					const textElement = writer.createElement('paragraph');
					writer.insertText(' ' + key + ' ', textElement);
					editor.model.insertContent(textElement, editor.model.document.selection);
				});

			});

			addListToDropdown(dropdownView, items);

			this.addSearchInput();
			this.styles();

			return dropdownView;
		});

	}

	addSearchInput() {

		const t = this.editor.t;

		setTimeout(function () {

			let panel = document.querySelector('.ck-dynamic-fields-dropdown .ck-dropdown__panel');

			let searchInput = document.createElement('input');

			searchInput.classList.add('search');
			searchInput.classList.add('form-control');
			searchInput.classList.add('w-full');
			searchInput.style.padding = '8px 10px';
			searchInput.style.background = 'white';
			searchInput.style.borderRadius = '0';
			searchInput.style.border = 'none';
			searchInput.style.borderBottom = 'solid 1px #eee';
			searchInput.style.position = 'sticky';
			searchInput.style.top = '0';
			searchInput.style.zIndex = '10';
			searchInput.setAttribute('placeholder', t('Search') + '..');

			panel.prepend(searchInput);

			searchInput.addEventListener('keyup', function(e) {

				let searchText = this.value;
				let buttons = document.querySelectorAll('.ck-dynamic-fields-dropdown .ck-dropdown__panel li');

				let hiddenButtons = 0;

				for (let i = 0; i < buttons.length; i++) {

					let btn = buttons[i];
					let txtValue = btn.innerText.trim();

					if (txtValue.toUpperCase().indexOf(searchText.toUpperCase()) > -1) {
						btn.style.display = 'block';
					} else {
						btn.style.display = 'none';
						hiddenButtons++;
					}
				}

				let noResult = panel.querySelector('.no-result');

				if (hiddenButtons === buttons.length) {
					if (!noResult) {

						let noResult = document.createElement('p');

						noResult.classList.add('no-result');
						noResult.classList.add('text-center');
						noResult.classList.add('m-10');
						noResult.innerHTML = t('No result');

						panel.append(noResult);
					}
				} else if (noResult) {
					noResult.remove();
				}

			});

		}, 0)

	}

	styles() {

		setTimeout(function () {
			document.querySelector('.ck-dynamic-fields-dropdown .ck-dropdown__panel').style.maxHeight = '400px';
			document.querySelector('.ck-dynamic-fields-dropdown .ck-dropdown__panel').style.overflowY = 'auto';
			document.querySelector('.ck-dynamic-fields-dropdown .ck-button__label').style.width = 'auto';
		}, 0);

	}

}
