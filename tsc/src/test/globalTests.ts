/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as assert from 'assert';
import * as os from 'os';

import { lsif } from './lsifs';
import { Element } from 'lsif-protocol';

suite('Global Module Tests', () => {
	test('Single export', async () => {
		const emitter = await lsif('/@test', new Map([
			['/@test/a.ts', 'let x = 10;']
		]), { });
		const validate: Element[] = [
			JSON.parse('{"id":11,"type":"vertex","label":"moniker","scheme":"tsc","identifier":":x","unique":"group","kind":"export"}')
		];
		for (const elem of validate) {
			assert.deepEqual(emitter.elements.get(elem.id), elem);
		}
	});
	test('Export in namespace', async () => {
		const emitter = await lsif('/@test', new Map([
			['/@test/a.ts', 'namespace N { export const a: number = 10; }']
		]), { });
		const validate: Element[] = [
			JSON.parse('{"id":11,"type":"vertex","label":"moniker","scheme":"tsc","identifier":":N","unique":"group","kind":"export"}'),
			JSON.parse('{"id":18,"type":"vertex","label":"moniker","scheme":"tsc","identifier":":N.a","unique":"group","kind":"export"}')
		];
		for (const elem of validate) {
			assert.deepEqual(emitter.elements.get(elem.id), elem);
		}
	});
	test('Private in namespace', async () => {
		const emitter = await lsif('/@test', new Map([
			['/@test/a.ts', 'namespace N { const a: number = 10; }']
		]), { });
		const validate: Element[] = [
			JSON.parse('{"id":11,"type":"vertex","label":"moniker","scheme":"tsc","identifier":":N","unique":"group","kind":"export"}'),
			JSON.parse('{"id":18,"type":"vertex","label":"moniker","scheme":"tsc","identifier":"g5yRGXDFrx4hhFmRmF/HHA==","unique":"document","kind":"local"}')
		];
		for (const elem of validate) {
			assert.deepEqual(emitter.elements.get(elem.id), elem);
		}
	});
	test('Same export name', async () => {
		const emitter = await lsif('/@test', new Map([
			[
				'/@test/a.ts',
				[
					'interface A { name: string; }',
					'namespace A { export const a: number = 10; }'
				].join(os.EOL)
			]
		]), { });
		const validate: Element[] = [
			JSON.parse('{"id":11,"type":"vertex","label":"moniker","scheme":"tsc","identifier":":A","unique":"group","kind":"export"}'),
			JSON.parse('{"id":20,"type":"vertex","label":"moniker","scheme":"tsc","identifier":":A.name","unique":"group","kind":"export"}'),
			JSON.parse('{"id":27,"type":"vertex","label":"moniker","scheme":"tsc","identifier":":A.a","unique":"group","kind":"export"}')
		];
		for (const elem of validate) {
			assert.deepEqual(emitter.elements.get(elem.id), elem);
		}
	});
	test('Export via type literal', async () => {
		const emitter = await lsif('/@test', new Map([
			[
				'/@test/a.ts',
				[
					'const x = { touch: false };'
				].join(os.EOL)
			]
		]), { });
		assert.deepEqual(emitter.lastId, 43);
		const validate: Element[] = [
			JSON.parse('{"id":11,"type":"vertex","label":"moniker","scheme":"tsc","identifier":":x","unique":"group","kind":"export"}'),
			JSON.parse('{"id":24,"type":"vertex","label":"moniker","scheme":"tsc","identifier":":x.touch","unique":"group","kind":"export"}')
		];
		for (const elem of validate) {
			assert.deepEqual(emitter.elements.get(elem.id), elem);
		}
	});
	test('Export in declaration file', async () => {
		const emitter = await lsif('/@test', new Map([
			[
				'/@test/a.d.ts',
				[
					'declare const x: { touch: false };'
				].join(os.EOL)
			]
		]), { });
		const validate: Element[] = [
			JSON.parse('{"id":11,"type":"vertex","label":"moniker","scheme":"tsc","identifier":":x","unique":"group","kind":"export"}'),
			JSON.parse('{"id":24,"type":"vertex","label":"moniker","scheme":"tsc","identifier":":x.touch","unique":"group","kind":"export"}')
		];
		for (const elem of validate) {
			assert.deepEqual(emitter.elements.get(elem.id), elem);
		}
	});
	test('Export function signature in declaration file', async () => {
		const emitter = await lsif('/@test', new Map([
			[
				'/@test/a.d.ts',
				[
					'declare const x: { (a: number): void; };'
				].join(os.EOL)
			]
		]), { });
		const validate: Element[] = [
			JSON.parse('{"id":11,"type":"vertex","label":"moniker","scheme":"tsc","identifier":":x","unique":"group","kind":"export"}'),
		];
		for (const elem of validate) {
			assert.deepEqual(emitter.elements.get(elem.id), elem);
		}
	});
	test('Interface with signature', async () => {
		const emitter = await lsif('/@test', new Map([
			[
				'/@test/a.d.ts',
				[
					'interface Thenable<T> {',
					'	then<TResult>(onfulfilled?: (value: T) => TResult | Thenable<TResult>, onrejected?: (reason: any) => TResult | Thenable<TResult>): Thenable<TResult>;',
					'	then<TResult>(onfulfilled?: (value: T) => TResult | Thenable<TResult>, onrejected?: (reason: any) => void): Thenable<TResult>;',
					'}'
				].join(os.EOL)
			],
			[
				'/@test/b.d.ts',
				[
					'interface Thenable<T> {',
					'	then<TResult>(onfulfilled?: (value: T) => TResult | Thenable<TResult>, onrejected?: (reason: any) => TResult | Thenable<TResult>): Thenable<TResult>;',
					'	then<TResult>(onfulfilled?: (value: T) => TResult | Thenable<TResult>, onrejected?: (reason: any) => void): Thenable<TResult>;',
					'}'
				].join(os.EOL)
			]
		]), { });
		assert.deepEqual(emitter.lastId, 385);
		const validate: Element[] = [
		];
		for (const elem of validate) {
			assert.deepEqual(emitter.elements.get(elem.id), elem);
		}
	});
	test('Ambient module', async () => {
		const emitter = await lsif('/@test', new Map([
			[
				'/@test/a.d.ts',
				[
					'declare const ApplicationInsights: number;',
					'declare module \'applicationinsights\' {',
    				'    export = ApplicationInsights;',
					'}'
				].join(os.EOL)
			]
		]), { });
		assert.deepEqual(emitter.lastId, 50);
		const validate: Element[] = [
			JSON.parse('{"id":26,"type":"vertex","label":"moniker","scheme":"tsc","identifier":":applicationinsights.export=","unique":"group","kind":"export"}')
		];
		for (const elem of validate) {
			assert.deepEqual(emitter.elements.get(elem.id), elem);
		}
	});
	test('Bug 76', async () => {
		const emitter = await lsif('/@test', new Map([
			[
				'/@test/a.d.ts',
				[
					'declare module chrome {',
					'	namespace _debugger {',
					'		export var onDetach: number;',
					'	}',
					'	export { _debugger as debugger }',
					'}'
				].join(os.EOL)
			],
			[
				'/@test/b.ts',
				[
					'chrome.debugger.onDetach;'
				].join(os.EOL)
			]
		]), { });
		assert.deepEqual(emitter.lastId, 84);
		const validate: Element[] = [
			JSON.parse('{"id":24,"type":"vertex","label":"resultSet"}'),
			JSON.parse('{"id":25,"type":"vertex","label":"moniker","scheme":"tsc","identifier":"qKuKQk2vMciItiwlUxWfVg==","unique":"document","kind":"local"}'),
			JSON.parse('{"id":26,"type":"edge","label":"moniker","outV":24,"inV":25}'),
			JSON.parse('{"id":27,"type":"vertex","label":"range","start":{"line":2,"character":13},"end":{"line":2,"character":21},"tag":{"type":"definition","text":"onDetach","kind":7,"fullRange":{"start":{"line":2,"character":13},"end":{"line":2,"character":29}}}}'),
			JSON.parse('{"id":28,"type":"edge","label":"next","outV":27,"inV":24}'),
			JSON.parse('{"id":42,"type":"vertex","label":"moniker","scheme":"tsc","identifier":"a:debugger.onDetach","unique":"group","kind":"export"}'),
			JSON.parse('{"id":43,"type":"edge","label":"attach","outV":42,"inV":25}')
		];
		for (const elem of validate) {
			assert.deepEqual(emitter.elements.get(elem.id), elem);
		}
	});
	test('Constructor Signature', async () => {
		const emitter = await lsif('/@test', new Map([
			[
				'/@test/a.d.ts',
				[
					'interface TestConstructor { new <K, V>(): [K, V] }'
				].join(os.EOL)
			],
			[
				'/@test/b.ts',
				[
					'let t = new TestConstructor<number, string>();'
				].join(os.EOL)
			]
		]), { });
		assert.deepEqual(emitter.lastId, 81);
		const validate: Element[] = [
		];
		for (const elem of validate) {
			assert.deepEqual(emitter.elements.get(elem.id), elem);
		}
	});
});