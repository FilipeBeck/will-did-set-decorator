/**
 * Handlers for `willSet` and `didSet`.
 */
interface SetListener {
	/**
	 * Handler for `willSet` (executed before property assignment).
	 */
	will?: Function
	/**
	 * Handler for `didSet` (executed after property assignment).
	 */
	did?: Function
}
/**
 * Prototype with relevant contextual information for `willSet` and `didSet` setup.
 */
interface Prototype {
	/**
	 * Prototype chain.
	 */
	__proto__: Prototype
	/**
	 * Constructor function.
	 */
	constructor: Function
}
/**
 * Scopes for accessors of each constructor, isolating themfrom the prototype chain.
 */
const scopes = new Map<Function, Record<symbol, SetListener>>()
/**
 * Retrieves the `target` scope  or creates a new if it does not exist.
 * @param target Prototype to be verified.
 * @returns The scope.
 */
function getScope(target: Prototype): Record<symbol, SetListener> {
	let scope = scopes.get(target.constructor)

	if (!scope) {
		scopes.set(target.constructor, scope = {})
	}

	return scope
}
/**
 * Shared symbols identified by property key.
 */
const keySymbols = new Map<string | symbol, symbol>()
/**
 * Retrives the symbol for the specified key or creates a new if it does not exist.
 * @param key Property key.
 */
function getKeySymbol(key: string | symbol): symbol {
	let keySymbol = keySymbols.get(key)

	if (!keySymbol) {
		keySymbols.set(key, keySymbol = Symbol(typeof key === 'string' ? key : key.description))
	}

	return keySymbol
}
/**
 * Retrieves the first assignment handler (`willSet` or `didSet` according the `phase`) for the symbol related to the property in the chain of `target` prototype.
 * @param phase Assignment phase (if `willSet` or `didSet`).
 * @param target Prototype to be verified.
 * @param keySymbol Symbol determing the property to be verified.
 * @returns The assignment handler or `undefined` if there are no handlers in the prototype chain.
 */
function getFirstSetHandler(phase: keyof SetListener, target: Prototype, keySymbol: symbol): Function | undefined {
	let handler: Function | undefined

	do {
		handler = getScope(target)[keySymbol]?.[phase]
		target = target.__proto__
	}
	while (!handler && target)

	return handler
}
/**
 * Bind accessor methods to `target` with `willSet` or/and `didSet` calls.
 * @param target Prototype where bind occurs.
 * @param keySymbol Property where bind occurs.
 * @param setListener Handlers for `willSet` and `didSet`.
 * @returns The updated property descriptor or `undefined` if it is already binded.
 */
function bindAccessor(target: Prototype, keySymbol: symbol, setListener: SetListener): PropertyDescriptor | undefined {
	const scope = getScope(target)
	const alreadyBinded = keySymbol in scope
	const listener: SetListener = scope[keySymbol] ||= {}

	Object.assign(listener, setListener)
	// If already binded, just update `handler` is enough.
	if (alreadyBinded) {
		return
	}

	return {
		get() {
			return this[keySymbol]
		},
		set(newValue: any) {
			const oldValue = this[keySymbol]

			listener.will?.call(this, newValue)
			this[keySymbol] = newValue
			listener.did?.call(this, oldValue)
		},
	} as PropertyDescriptor & ThisType<any>
}
/**
 * Attach a handler that will be executed just before the property is modified. The order of calls is from subclass to superclass. That is, if the class `A` has a `foo` property decorated with `willSet` and the subclass `B` decorates the same property with `willSet`, first `B.willSet` will be called, after `A.willSet`.
 * @param handler Function called with the new value (the value after assignment).
 * @returns The decorator method.
 */
export function willSet(handler: (newValue: any) => void): PropertyDecorator {
	return function (target: Object, propertyKey: string | symbol): PropertyDescriptor | undefined {
		const prototype = target as Prototype
		const keySymbol = getKeySymbol(propertyKey)
		const superWillSet = getFirstSetHandler('will', prototype, keySymbol)
		const superDidSet = getFirstSetHandler('did', prototype, keySymbol)
		/**
		 * Handler for `willSet`. Ensures that the `willSet` of superclass will be called just after if it exists.
		 * @param this Instance where `newValue` will be assigned.
		 * @param newValue Value after assignment.
		 */
		function thisWillSet(this: object, newValue: any) {
			handler.call(this, newValue)
			superWillSet?.call(this, newValue)
		}

		return bindAccessor(prototype, keySymbol, { will: thisWillSet, did: superDidSet })
	}
}
/**
 * Attach a handler that will be executed just after the property is modified. The order of calls is from superclass to subclass. That is, if the class `A` has a `foo` property decorated with `didSet` and the subclass `B` decorates the same property with `didSet`, first `A.didSet` will be called, after `B.didSet`.
 * @param handler Function called with the old value (the value before assignment - undefined in the first call).
 * @returns The decorator method.
 */
export function didSet(handler: (oldValue: any) => void): PropertyDecorator {
	return function (target: Object, propertyKey: string | symbol): PropertyDescriptor | undefined {
		const prototype = target as Prototype
		const keySymbol = getKeySymbol(propertyKey)
		const superWillSet = getFirstSetHandler('will', prototype, keySymbol)
		const superDidSet = getFirstSetHandler('did', prototype, keySymbol)
		/**
		 * Handler for `didSet`. Ensures that the `didSet` of superclass will be called just before if it exists.
		 * @param this Instance where `oldValue` was assigned.
		 * @param oldValue Value before assignment.
		 */
		function thisDidSet(this: object, oldValue: any) {
			superDidSet?.call(this, oldValue)
			handler.call(this, oldValue)
		}

		return bindAccessor(prototype, keySymbol, { will: superWillSet, did: thisDidSet })
	}
}
