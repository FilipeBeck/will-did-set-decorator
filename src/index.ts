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
interface Prototype extends Object {
	/**
	 * Prototype chain.
	 */
	__proto__: Prototype
	/**
	 * Constructor with assignment handlers information.
	 */
	constructor: Function & Record<symbol, SetListener>
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
 * Retrieves the `target` constructor's own `setListener`.
 * @param target Prototype with constructor to be verified.
 * @returns The listener if constructor of `target` has it as own property.
 */
function getOwnListener(target: Prototype, keySymbol: symbol): SetListener | void {
	if (target.constructor.hasOwnProperty(keySymbol)) {
		return target.constructor[keySymbol]
	}
}
/**
 * Update the `target` constructor's own listener with `setListener`.
 * @param target Prototype with constructor to be updated.
 * @param keySymbol Key of listener to be updated.
 * @param setListener Listener to be assigned.
 * @returns The updated listener.
 */
function putOwnListener(target: Prototype, keySymbol: symbol, setListener: SetListener): SetListener {
	if (!target.constructor.hasOwnProperty(keySymbol)) {
		return target.constructor[keySymbol] = setListener
	}
	else {
		return Object.assign(target.constructor[keySymbol], setListener)
	}
}
/**
 * Retrieves a copy of closest assignment handlers (`willSet` and `didSet`) for the symbol related to the property in the chain of `target` constructor.
 * @param target Prototype to be verified.
 * @param propertyKey Symbol determing the property to be verified.
 * @returns The assignment handlers or `{}` if there are no handlers in the prototype chain.
 */
function getClosestListener(target: Prototype, keySymbol: symbol): SetListener {
	return { ...target.constructor[keySymbol] }
}
/**
 * Bind accessor methods to `target` with `willSet` or/and `didSet` calls.
 * @param target Prototype where bind occurs.
 * @param keySymbol Property where bind occurs.
 * @param setListener Handlers for `willSet` and `didSet`.
 * @returns The updated property descriptor or `undefined` if it is already binded.
 */
function bindAccessor(target: Prototype, keySymbol: symbol, setListener: SetListener): PropertyDescriptor | undefined {
	const previousListener = getOwnListener(target, keySymbol)
	const listener = putOwnListener(target, keySymbol, setListener)

	// If already binded, just update `listener` is enough.
	if (previousListener) {
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
		const keySymbol = getKeySymbol(propertyKey)
		const listener = getClosestListener(target as Prototype, keySymbol)
		const closestWill = listener.will
		/**
		 * Handler for `willSet`. Ensures that the closest `willSet` will be called just after if it exists.
		 * @param this Instance where `newValue` will be assigned.
		 * @param newValue Value after assignment.
		 */
		listener.will = function(this: object, newValue: any) {
			handler.call(this, newValue)
			closestWill?.call(this, newValue)
		}

		return bindAccessor(target as Prototype, keySymbol, listener)
	}
}
/**
 * Attach a handler that will be executed just after the property is modified. The order of calls is from superclass to subclass. That is, if the class `A` has a `foo` property decorated with `didSet` and the subclass `B` decorates the same property with `didSet`, first `A.didSet` will be called, after `B.didSet`.
 * @param handler Function called with the old value (the value before assignment - undefined in the first call).
 * @returns The decorator method.
 */
export function didSet(handler: (oldValue: any) => void): PropertyDecorator {
	return function (target: Object, propertyKey: string | symbol): PropertyDescriptor | undefined {
		const keySymbol = getKeySymbol(propertyKey)
		const listener = getClosestListener(target as Prototype, keySymbol)
		const closestDid = listener.did
		/**
		 * Handler for `didSet`. Ensures that the closest `didSet` will be called just before if it exists.
		 * @param this Instance where `oldValue` was assigned.
		 * @param oldValue Value before assignment.
		 */
		listener.did = function(this: object, oldValue: any) {
			closestDid?.call(this, oldValue)
			handler.call(this, oldValue)
		}

		return bindAccessor(target as Prototype, keySymbol, listener)
	}
}
