import { EasyMDE2 } from './EasyMDE2.js';


// Safari, in Private Browsing Mode, looks like it supports localStorage but all calls to setItem throw QuotaExceededError. We're going to detect this and set a constiable accordingly.
function isLocalStorageAvailable() {
	if (typeof localStorage === 'object') {
		try {
			localStorage.setItem('smde_localStorage', 1);
			localStorage.removeItem('smde_localStorage');
		}
		catch (e) {
			return false;
		}
	}
	else {
		return false;
	}

	return true;
}


export const autosave = function(this: EasyMDE2) {
	if (!isLocalStorageAvailable())
		return console.log('EasyMDE: localStorage not available, cannot autosave');
	if (!this.options.autosave)
		return;
	if (this.options.autosave.uniqueId == undefined || this.options.autosave.uniqueId == '')
		return console.log('EasyMDE: You must set a uniqueId to use the autosave feature');

	if (this.options.autosave.binded !== true) {
		if (this.element.form != null && this.element.form != undefined) {
			this.element.form.addEventListener('submit', () => {
				clearTimeout(this.autosaveTimeoutId);
				this.autosaveTimeoutId = undefined;

				localStorage.removeItem('smde_' + this.options.autosave.uniqueId);
			});
		}

		this.options.autosave.binded = true;
	}

	if (this.options.autosave.loaded !== true) {
		if (typeof localStorage.getItem('smde_' + this.options.autosave.uniqueId) == 'string' && localStorage.getItem('smde_' + this.options.autosave.uniqueId) != '') {
			this.codemirror.setValue(localStorage.getItem('smde_' + this.options.autosave.uniqueId));
			this.options.autosave.foundSavedValue = true;
		}

		this.options.autosave.loaded = true;
	}

	const value = this.value();
	if (value !== '')
		localStorage.setItem('smde_' + this.options.autosave.uniqueId, value);
	else
		localStorage.removeItem('smde_' + this.options.autosave.uniqueId);

	const el = document.getElementById('autosaved');
	if (el) {
		const d = new Date();
		const dd = new Intl.DateTimeFormat(
			[ this.options.autosave.timeFormat.locale, 'en-US' ],
			this.options.autosave.timeFormat.format,
		).format(d);

		const save = this.options.autosave.text == undefined
			? 'Autosaved: '
			: this.options.autosave.text;

		el.innerHTML = save + dd;
	}
};
