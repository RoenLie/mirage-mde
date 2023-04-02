import { type RecordOf } from './mirage-mde-types.js';


const _insertTexts = {
	link:           [ '[', '](#url#)' ],
	image:          [ '![', '](#url#)' ],
	uploadedImage:  [ '![](#url#)', '' ],
	// uploadedImage: ['![](#url#)\n', ''], // TODO: New line insertion doesn't work here.
	table:          [ '', '\n\n| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Text     | Text     | Text     |\n\n' ],
	horizontalRule: [ '', '\n\n-----\n\n' ],
};
export const insertTexts: RecordOf<typeof _insertTexts, string, string[]> = _insertTexts;


const _promptTexts = {
	link:  'URL for the link:',
	image: 'URL of the image:',
};
export const promptTexts: RecordOf<typeof _promptTexts, string, string> = _promptTexts;


const _timeFormat = {
	locale: 'en-US',
	format: {
		hour:   '2-digit',
		minute: '2-digit',
	},
};
export const timeFormat: RecordOf<
	typeof _timeFormat,
	string,
	string | {hour: string; minute: string}
> = _timeFormat;


const _blockStyles = {
	'bold':   '**',
	'code':   '```',
	'italic': '*',
};
export const blockStyles: RecordOf<typeof _blockStyles, string, string> = _blockStyles;


/**
 * Texts displayed to the user (mainly on the status bar) for the import image
 * feature. Can be used for customization or internationalization.
 */
const _imageTexts = {
	sbInit:        'Attach files by drag and dropping or pasting from clipboard.',
	sbOnDragEnter: 'Drop image to upload it.',
	sbOnDrop:      'Uploading image #images_names#...',
	sbProgress:    'Uploading #file_name#: #progress#%',
	sbOnUploaded:  'Uploaded #image_name#',
	sizeUnits:     ' B, KB, MB',
};
export const imageTexts: RecordOf<typeof _imageTexts, string, string> = _imageTexts;


/**
 * Errors displayed to the user, using the `errorCallback` option. Can be used for
 * customization or internationalization.
 */
const _errorMessages = {
	noFileGiven:    'You must select a file.',
	typeNotAllowed: 'This image type is not allowed.',
	ficonstooLarge: 'Image #image_name# is too big (#image_size#).\n' +
        'Maximum file size is #image_max_size#.',
	importError: 'Something went wrong when uploading the image #image_name#.',
};
export const errorMessages: RecordOf<typeof _errorMessages, string, string> = _errorMessages;
