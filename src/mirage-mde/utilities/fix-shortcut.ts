export const isMac = /Mac/.test(navigator.platform);


/**
 * Fix shortcut. Mac use Command, others use Ctrl.
 */
export const fixShortcut = (name: string) => {
	if (isMac)
		name = name.replace('Ctrl', 'Cmd');
	else
		name = name.replace('Cmd', 'Ctrl');

	return name;
};
