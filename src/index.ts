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
}
/**
 * Scopes for accessors of each constructor, isolating them from the prototype chain.
 */
const scopes = new Map<Prototype, Record<symbol, SetListener>>()
/**
 * Retrieves the `target` scope  or creates a new if it does not exist.
 * @param target Prototype to be verified.
 * @returns The scope.
 */
function getScope(target: Prototype): Record<symbol, SetListener> {
	let scope = scopes.get(target)

	if (!scope) {
		scopes.set(target, scope = {})
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
 * Retrieves the closest assignment handlers (`willSet` and `didSet`) for the symbol related to the property in the chain of `target` prototype.
 * @param target Prototype to be verified.
 * @param propertyKey Symbol determing the property to be verified.
 * @returns The assignment handlers or `{}` if there are no handlers in the prototype chain.
 */
function getClosestHandlers(target: Prototype, keySymbol: symbol): SetListener {
	const listener: SetListener = {}

	do {
		const scope = getScope(target)[keySymbol]

		if (scope) {
			if (scope.will) {
				listener.will = scope.will
			}

			if (scope.did) {
				listener.did = scope.did
			}
		}

		target = target.__proto__
	}
	while (!(listener.will && listener.did) && target)

	return listener
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
	// If already binded, just update `listener` is enough.
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
		const keySymbol = getKeySymbol(propertyKey)
		const closetHandlers = getClosestHandlers(target as Prototype, keySymbol)
		/**
		 * Handler for `willSet`. Ensures that the `willSet` of superclass will be called just after if it exists.
		 * @param this Instance where `newValue` will be assigned.
		 * @param newValue Value after assignment.
		 */
		function thisWillSet(this: object, newValue: any) {
			handler.call(this, newValue)
			closetHandlers.will?.call(this, newValue)
		}

		return bindAccessor(target as Prototype, keySymbol, { will: thisWillSet, did: closetHandlers.did })
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
		const closestHandlers = getClosestHandlers(target as Prototype, keySymbol)
		/**
		 * Handler for `didSet`. Ensures that the `didSet` of superclass will be called just before if it exists.
		 * @param this Instance where `oldValue` was assigned.
		 * @param oldValue Value before assignment.
		 */
		function thisDidSet(this: object, oldValue: any) {
			closestHandlers.did?.call(this, oldValue)
			handler.call(this, oldValue)
		}

		return bindAccessor(target as Prototype, keySymbol, { will: closestHandlers.will, did: thisDidSet })
	}
}
