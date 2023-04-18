import { StringLiteral } from '@roenlie/mimic-core/types';

import { MirageMDE } from '../mirage-mde.js';
import { BuiltInAction, builtInActions, ToolbarItem } from './action-registry.js';
import { BuiltInDrawables, builtInDraws } from './draw-registry.js';
import { builtInStatuses, StatusBarItem } from './status-registry.js';


export type Registry = {
	action: Map<StringLiteral | BuiltInAction, ToolbarItem>;
	status: Map<StringLiteral, StatusBarItem>;
	draw: Map<StringLiteral | BuiltInDrawables, string>;
}


export const registries = new WeakMap<MirageMDE, Registry>();


export const createRegistry = (scope: MirageMDE): Registry => {
	const registry = {
		action: new Map(builtInActions),
		status: new Map(builtInStatuses),
		draw:   new Map(builtInDraws),
	};

	registries.set(scope, registry);

	return registry;
};
