import { willSet, didSet } from '../src/index'

describe('willSet', () => {
	const check = jest.fn()

	afterEach(check.mockClear)

	it('calls before assignment with key of type string', () => {
		class Clazz {
			@willSet(function(this: Clazz, newValue: string) {
				check(this, this.prop, newValue)
			})
			public prop = 'a'
		}

		const clazz = new Clazz()
		clazz.prop = 'b'
		clazz.prop = 'c'


		expect(check).toBeCalledTimes(3)

		expect(check).nthCalledWith(1, clazz, undefined, 'a')
		expect(check).nthCalledWith(2, clazz, 'a', 'b')
		expect(check).nthCalledWith(3, clazz, 'b', 'c')
	})

	it('calls before assignment with key of type symbol', () => {
		const prop = Symbol()

		class Clazz {
			@willSet(function(this: Clazz, newValue: string) {
				check(this, this[prop], newValue)
			})
			public [prop] = 'a'
		}

		const clazz = new Clazz()
		clazz[prop] = 'b'
		clazz[prop] = 'c'

		expect(check).toBeCalledTimes(3)

		expect(check).nthCalledWith(1, clazz, undefined, 'a')
		expect(check).nthCalledWith(2, clazz, 'a', 'b')
		expect(check).nthCalledWith(3, clazz, 'b', 'c')
	})

	it('handles multiple decorators with key of type string', () => {
		class Clazz {
			@willSet(function(this: Clazz, newValue: string) {
				check(this, 'prop1', this.prop1, newValue)
			})
			public prop1 = 'a'

			@willSet(function(this: Clazz, newValue: string) {
				check(this, 'prop2', this.prop2, newValue)
			})
			public prop2 = 'a'
		}

		const clazz = new Clazz()
		clazz.prop1 = 'b'
		clazz.prop2 = 'b'

		expect(check).toBeCalledTimes(4)

		expect(check).nthCalledWith(1, clazz, 'prop1', undefined, 'a')
		expect(check).nthCalledWith(2, clazz, 'prop2', undefined, 'a')
		expect(check).nthCalledWith(3, clazz, 'prop1', 'a', 'b')
		expect(check).nthCalledWith(4, clazz, 'prop2', 'a', 'b')
	})

	it('handles multiple decorators with key of type symbol', () => {
		const prop1 = Symbol()
		const prop2 = Symbol()

		class Clazz {
			@willSet(function(this: Clazz, newValue: string) {
				check(this, prop1, this[prop1], newValue)
			})
			public [prop1] = 'a'

			@willSet(function(this: Clazz, newValue: string) {
				check(this, prop2, this[prop2], newValue)
			})
			public [prop2] = 'a'
		}

		const clazz = new Clazz()
		clazz[prop1] = 'b'
		clazz[prop2] = 'b'

		expect(check).toBeCalledTimes(4)

		expect(check).nthCalledWith(1, clazz, prop1, undefined, 'a')
		expect(check).nthCalledWith(2, clazz, prop2, undefined, 'a')
		expect(check).nthCalledWith(3, clazz, prop1, 'a', 'b')
		expect(check).nthCalledWith(4, clazz, prop2, 'a', 'b')
	})

	it('calls in the correct order when overriding with key of type string', () => {
		class SuperClass {
			@willSet(function(this: SuperClass, newValue: string) {
				check(this, SuperClass, this.prop, newValue)
			})
			public prop = 'superA'
		}

		class InterClass extends SuperClass {}

		class SubClass extends InterClass {
			@willSet(function(this: SubClass, newValue: string) {
				check(this, SubClass, this.prop, newValue)
			})
			public override prop = 'subA'
		}

		const clazz = new SubClass()
		clazz.prop = 'b'
		clazz.prop = 'c'

		expect(check).toBeCalledTimes(8)

		expect(check).nthCalledWith(1, clazz, SubClass, undefined, 'superA')
		expect(check).nthCalledWith(2, clazz, SuperClass, undefined, 'superA')

		expect(check).nthCalledWith(3, clazz, SubClass, 'superA', 'subA')
		expect(check).nthCalledWith(4, clazz, SuperClass, 'superA', 'subA')

		expect(check).nthCalledWith(5, clazz, SubClass, 'subA', 'b')
		expect(check).nthCalledWith(6, clazz, SuperClass, 'subA', 'b')

		expect(check).nthCalledWith(7, clazz, SubClass, 'b', 'c')
		expect(check).nthCalledWith(8, clazz, SuperClass, 'b', 'c')
	})

	it('calls in the correct order when overriding with key of type symbol', () => {
		const prop = Symbol()

		class SuperClass {
			@willSet(function(this: SuperClass, newValue: string) {
				check(this, SuperClass, this[prop], newValue)
			})
			public [prop] = 'superA'
		}

		class interClass extends SuperClass {}

		class SubClass extends interClass {
			@willSet(function(this: SubClass, newValue: string) {
				check(this, SubClass, this[prop], newValue)
			})
			public override [prop] = 'subA'
		}

		const clazz = new SubClass()
		clazz[prop] = 'b'
		clazz[prop] = 'c'

		expect(check).toBeCalledTimes(8)

		expect(check).nthCalledWith(1, clazz, SubClass, undefined, 'superA')
		expect(check).nthCalledWith(2, clazz, SuperClass, undefined, 'superA')

		expect(check).nthCalledWith(3, clazz, SubClass, 'superA', 'subA')
		expect(check).nthCalledWith(4, clazz, SuperClass, 'superA', 'subA')

		expect(check).nthCalledWith(5, clazz, SubClass, 'subA', 'b')
		expect(check).nthCalledWith(6, clazz, SuperClass, 'subA', 'b')

		expect(check).nthCalledWith(7, clazz, SubClass, 'b', 'c')
		expect(check).nthCalledWith(8, clazz, SuperClass, 'b', 'c')
	})
})

describe('didSet', () => {
	const check = jest.fn()

	afterEach(check.mockClear)

	it('calls after assignment with key of type string', () => {
		class Clazz {
			@didSet(function(this: Clazz, oldValue: string) {
				check(this, this.prop, oldValue)
			})
			public prop = 'a'
		}

		const clazz = new Clazz()
		clazz.prop = 'b'
		clazz.prop = 'c'


		expect(check).toBeCalledTimes(3)

		expect(check).nthCalledWith(1, clazz, 'a', undefined)
		expect(check).nthCalledWith(2, clazz, 'b', 'a')
		expect(check).nthCalledWith(3, clazz, 'c', 'b')
	})

	it('calls after assignment with key of type symbol', () => {
		const prop = Symbol()

		class Clazz {
			@didSet(function(this: Clazz, oldValue: string) {
				check(this, this[prop], oldValue)
			})
			public [prop] = 'a'
		}

		const clazz = new Clazz()
		clazz[prop] = 'b'
		clazz[prop] = 'c'

		expect(check).toBeCalledTimes(3)

		expect(check).nthCalledWith(1, clazz, 'a', undefined)
		expect(check).nthCalledWith(2, clazz, 'b', 'a')
		expect(check).nthCalledWith(3, clazz, 'c', 'b')
	})

	it('handles multiple decorators with key of type string', () => {
		class Clazz {
			@didSet(function(this: Clazz, oldValue: string) {
				check(this, 'prop1', this.prop1, oldValue)
			})
			public prop1 = 'a'

			@didSet(function(this: Clazz, oldValue: string) {
				check(this, 'prop2', this.prop2, oldValue)
			})
			public prop2 = 'a'
		}

		const clazz = new Clazz()
		clazz.prop1 = 'b'
		clazz.prop2 = 'b'

		expect(check).toBeCalledTimes(4)

		expect(check).nthCalledWith(1, clazz, 'prop1', 'a', undefined)
		expect(check).nthCalledWith(2, clazz, 'prop2', 'a', undefined)
		expect(check).nthCalledWith(3, clazz, 'prop1', 'b', 'a')
		expect(check).nthCalledWith(4, clazz, 'prop2', 'b', 'a')
	})

	it('handles multiple decorators with key of type symbol', () => {
		const prop1 = Symbol()
		const prop2 = Symbol()

		class Clazz {
			@didSet(function(this: Clazz, oldValue: string) {
				check(this, prop1, this[prop1], oldValue)
			})
			public [prop1] = 'a'

			@didSet(function(this: Clazz, oldValue: string) {
				check(this, prop2, this[prop2], oldValue)
			})
			public [prop2] = 'a'
		}

		const clazz = new Clazz()
		clazz[prop1] = 'b'
		clazz[prop2] = 'b'

		expect(check).toBeCalledTimes(4)

		expect(check).nthCalledWith(1, clazz, prop1, 'a', undefined)
		expect(check).nthCalledWith(2, clazz, prop2, 'a', undefined)
		expect(check).nthCalledWith(3, clazz, prop1, 'b', 'a')
		expect(check).nthCalledWith(4, clazz, prop2, 'b', 'a')
	})

	it('calls in the correct order when overriding with key of type string', () => {
		class SuperClass {
			@didSet(function(this: SuperClass, oldValue: string) {
				check(this, SuperClass, this.prop, oldValue)
			})
			public prop = 'superA'
		}

		class InterClass extends SuperClass {}

		class SubClass extends InterClass {
			@didSet(function(this: SubClass, oldValue: string) {
				check(this, SubClass, this.prop, oldValue)
			})
			public override prop = 'subA'
		}

		const clazz = new SubClass()
		clazz.prop = 'b'
		clazz.prop = 'c'

		expect(check).toBeCalledTimes(8)

		expect(check).nthCalledWith(1, clazz, SuperClass, 'superA', undefined)
		expect(check).nthCalledWith(2, clazz, SubClass, 'superA', undefined)

		expect(check).nthCalledWith(3, clazz, SuperClass, 'subA', 'superA')
		expect(check).nthCalledWith(4, clazz, SubClass, 'subA', 'superA')

		expect(check).nthCalledWith(5, clazz, SuperClass, 'b', 'subA')
		expect(check).nthCalledWith(6, clazz, SubClass, 'b', 'subA')

		expect(check).nthCalledWith(7, clazz, SuperClass, 'c', 'b')
		expect(check).nthCalledWith(8, clazz, SubClass, 'c', 'b')
	})

	it('calls in the correct order when overriding with key of type symbol', () => {
		const prop = Symbol()

		class SuperClass {
			@didSet(function(this: SuperClass, oldValue: string) {
				check(this, SuperClass, this[prop], oldValue)
			})
			public [prop] = 'superA'
		}

		class InterClass extends SuperClass {}

		class SubClass extends InterClass {
			@didSet(function(this: SubClass, oldValue: string) {
				check(this, SubClass, this[prop], oldValue)
			})
			public override [prop] = 'subA'
		}

		const clazz = new SubClass()
		clazz[prop] = 'b'
		clazz[prop] = 'c'

		expect(check).toBeCalledTimes(8)

		expect(check).nthCalledWith(1, clazz, SuperClass, 'superA', undefined)
		expect(check).nthCalledWith(2, clazz, SubClass, 'superA', undefined)

		expect(check).nthCalledWith(3, clazz, SuperClass, 'subA', 'superA')
		expect(check).nthCalledWith(4, clazz, SubClass, 'subA', 'superA')

		expect(check).nthCalledWith(5, clazz, SuperClass, 'b', 'subA')
		expect(check).nthCalledWith(6, clazz, SubClass, 'b', 'subA')

		expect(check).nthCalledWith(7, clazz, SuperClass, 'c', 'b')
		expect(check).nthCalledWith(8, clazz, SubClass, 'c', 'b')
	})
})

describe('willSet + didSet', () => {
	const check = jest.fn()

	afterEach(check.mockClear)

	it('calls in the appropriate time with key of type string', () => {
		class Clazz {
			@willSet(function(this: Clazz, newValue: string) {
				check(this, 'will', this.prop, newValue)
			})
			@didSet(function(this: Clazz, oldValue: string) {
				check(this, 'did', this.prop, oldValue)
			})
			public prop = 'a'
		}

		const clazz = new Clazz()
		clazz.prop = 'b'
		clazz.prop = 'c'


		expect(check).toBeCalledTimes(6)

		expect(check).nthCalledWith(1, clazz, 'will', undefined, 'a')
		expect(check).nthCalledWith(2, clazz, 'did', 'a', undefined)

		expect(check).nthCalledWith(3, clazz, 'will', 'a', 'b')
		expect(check).nthCalledWith(4, clazz, 'did', 'b', 'a')

		expect(check).nthCalledWith(5, clazz,  'will', 'b', 'c')
		expect(check).nthCalledWith(6, clazz,  'did', 'c', 'b')
	})

	it('calls in the appropriate time with key of type symbol', () => {
		const prop = Symbol()

		class Clazz {
			@willSet(function(this: Clazz, newValue: string) {
				check(this, 'will', this[prop], newValue)
			})
			@didSet(function(this: Clazz, oldValue: string) {
				check(this, 'did', this[prop], oldValue)
			})
			public [prop] = 'a'
		}

		const clazz = new Clazz()
		clazz[prop] = 'b'
		clazz[prop] = 'c'

		expect(check).toBeCalledTimes(6)

		expect(check).nthCalledWith(1, clazz, 'will', undefined, 'a')
		expect(check).nthCalledWith(2, clazz, 'did', 'a', undefined)

		expect(check).nthCalledWith(3, clazz, 'will', 'a', 'b')
		expect(check).nthCalledWith(4, clazz, 'did', 'b', 'a')

		expect(check).nthCalledWith(5, clazz, 'will', 'b', 'c')
		expect(check).nthCalledWith(6, clazz, 'did', 'c', 'b')
	})

	it('handles multiple decorators with key of type string', () => {
		class Clazz {
			@willSet(function(this: Clazz, newValue: string) {
				check(this, 'will', 'prop1', this.prop1, newValue)
			})
			@didSet(function(this: Clazz, oldValue: string) {
				check(this, 'did', 'prop1', this.prop1, oldValue)
			})
			public prop1 = 'a'

			@willSet(function(this: Clazz, newValue: string) {
				check(this, 'will', 'prop2', this.prop2, newValue)
			})
			@didSet(function(this: Clazz, oldValue: string) {
				check(this, 'did', 'prop2', this.prop2, oldValue)
			})
			public prop2 = 'a'
		}

		const clazz = new Clazz()
		clazz.prop1 = 'b'
		clazz.prop2 = 'b'

		expect(check).toBeCalledTimes(8)

		expect(check).nthCalledWith(1, clazz, 'will', 'prop1', undefined, 'a')
		expect(check).nthCalledWith(2, clazz, 'did', 'prop1', 'a', undefined)

		expect(check).nthCalledWith(3, clazz, 'will', 'prop2', undefined, 'a')
		expect(check).nthCalledWith(4, clazz, 'did', 'prop2', 'a', undefined)

		expect(check).nthCalledWith(5, clazz, 'will', 'prop1', 'a', 'b')
		expect(check).nthCalledWith(6, clazz, 'did', 'prop1', 'b', 'a')

		expect(check).nthCalledWith(7, clazz, 'will', 'prop2', 'a', 'b')
		expect(check).nthCalledWith(8, clazz, 'did', 'prop2', 'b', 'a')
	})

	it('handles multiple decorators with key of type symbol', () => {
		const prop1 = Symbol()
		const prop2 = Symbol()

		class Clazz {
			@willSet(function(this: Clazz, newValue: string) {
				check(this, 'will', prop1, this[prop1], newValue)
			})
			@didSet(function(this: Clazz, oldValue: string) {
				check(this, 'did', prop1, this[prop1], oldValue)
			})
			public [prop1] = 'a'

			@willSet(function(this: Clazz, newValue: string) {
				check(this, 'will', prop2, this[prop2], newValue)
			})
			@didSet(function(this: Clazz, oldValue: string) {
				check(this, 'did', prop2, this[prop2], oldValue)
			})
			public [prop2] = 'a'
		}

		const clazz = new Clazz()
		clazz[prop1] = 'b'
		clazz[prop2] = 'b'

		expect(check).toBeCalledTimes(8)

		expect(check).nthCalledWith(1, clazz, 'will', prop1, undefined, 'a')
		expect(check).nthCalledWith(2, clazz, 'did', prop1, 'a', undefined)

		expect(check).nthCalledWith(3, clazz, 'will', prop2, undefined, 'a')
		expect(check).nthCalledWith(4, clazz, 'did', prop2, 'a', undefined)

		expect(check).nthCalledWith(5, clazz, 'will', prop1, 'a', 'b')
		expect(check).nthCalledWith(6, clazz, 'did', prop1, 'b', 'a')

		expect(check).nthCalledWith(7, clazz, 'will', prop2, 'a', 'b')
		expect(check).nthCalledWith(8, clazz, 'did', prop2, 'b', 'a')
	})

	it('calls in the correct order when overriding with key of type string', () => {
		class SuperClass {
			@willSet(function(this: SuperClass, newValue: string) {
				check(this, 'will', SuperClass, this.prop, newValue)
			})
			@didSet(function(this: SuperClass, oldValue: string) {
				check(this, 'did', SuperClass, this.prop, oldValue)
			})
			public prop = 'superA'
		}

		class InterClass extends SuperClass {}

		class SubClass extends InterClass {
			@willSet(function(this: SubClass, newValue: string) {
				check(this, 'will', SubClass, this.prop, newValue)
			})
			@didSet(function(this: SubClass, oldValue: string) {
				check(this, 'did', SubClass, this.prop, oldValue)
			})
			public override prop = 'subA'
		}

		const clazz = new SubClass()
		clazz.prop = 'b'
		clazz.prop = 'c'

		expect(check).toBeCalledTimes(16)

		expect(check).nthCalledWith(1, clazz, 'will', SubClass, undefined, 'superA')
		expect(check).nthCalledWith(2, clazz, 'will', SuperClass, undefined, 'superA')
		expect(check).nthCalledWith(3, clazz, 'did', SuperClass, 'superA', undefined)
		expect(check).nthCalledWith(4, clazz, 'did', SubClass, 'superA', undefined)

		expect(check).nthCalledWith(5, clazz, 'will', SubClass, 'superA', 'subA')
		expect(check).nthCalledWith(6, clazz, 'will', SuperClass, 'superA', 'subA')
		expect(check).nthCalledWith(7, clazz, 'did', SuperClass, 'subA', 'superA')
		expect(check).nthCalledWith(8, clazz, 'did', SubClass, 'subA', 'superA')

		expect(check).nthCalledWith(9, clazz, 'will', SubClass, 'subA', 'b')
		expect(check).nthCalledWith(10, clazz, 'will', SuperClass, 'subA', 'b')
		expect(check).nthCalledWith(11, clazz, 'did', SuperClass, 'b', 'subA')
		expect(check).nthCalledWith(12, clazz, 'did', SubClass, 'b', 'subA')

		expect(check).nthCalledWith(13, clazz, 'will', SubClass, 'b', 'c')
		expect(check).nthCalledWith(14, clazz, 'will', SuperClass, 'b', 'c')
		expect(check).nthCalledWith(15, clazz, 'did', SuperClass, 'c', 'b')
		expect(check).nthCalledWith(16, clazz, 'did', SubClass, 'c', 'b')
	})

	it('calls in the correct order when overriding with key of type symbol', () => {
		const prop = Symbol()

		class SuperClass {
			@willSet(function(this: SuperClass, newValue: string) {
				check(this, 'will', SuperClass, this[prop], newValue)
			})
			@didSet(function(this: SuperClass, oldValue: string) {
				check(this, 'did', SuperClass, this[prop], oldValue)
			})
			public [prop] = 'superA'
		}

		class InterClass extends SuperClass {}

		class SubClass extends InterClass {
			@willSet(function(this: SubClass, newValue: string) {
				check(this, 'will', SubClass, this[prop], newValue)
			})
			@didSet(function(this: SubClass, oldValue: string) {
				check(this, 'did', SubClass, this[prop], oldValue)
			})
			public override [prop] = 'subA'
		}

		const clazz = new SubClass()
		clazz[prop] = 'b'
		clazz[prop] = 'c'

		expect(check).toBeCalledTimes(16)

		expect(check).nthCalledWith(1, clazz, 'will', SubClass, undefined, 'superA')
		expect(check).nthCalledWith(2, clazz, 'will', SuperClass, undefined, 'superA')
		expect(check).nthCalledWith(3, clazz, 'did', SuperClass, 'superA', undefined)
		expect(check).nthCalledWith(4, clazz, 'did', SubClass, 'superA', undefined)

		expect(check).nthCalledWith(5, clazz, 'will', SubClass, 'superA', 'subA')
		expect(check).nthCalledWith(6, clazz, 'will', SuperClass, 'superA', 'subA')
		expect(check).nthCalledWith(7, clazz, 'did', SuperClass, 'subA', 'superA')
		expect(check).nthCalledWith(8, clazz, 'did', SubClass, 'subA', 'superA')

		expect(check).nthCalledWith(9, clazz, 'will', SubClass, 'subA', 'b')
		expect(check).nthCalledWith(10, clazz, 'will', SuperClass, 'subA', 'b')
		expect(check).nthCalledWith(11, clazz, 'did', SuperClass, 'b', 'subA')
		expect(check).nthCalledWith(12, clazz, 'did', SubClass, 'b', 'subA')

		expect(check).nthCalledWith(13, clazz, 'will', SubClass, 'b', 'c')
		expect(check).nthCalledWith(14, clazz, 'will', SuperClass, 'b', 'c')
		expect(check).nthCalledWith(15, clazz, 'did', SuperClass, 'c', 'b')
		expect(check).nthCalledWith(16, clazz, 'did', SubClass, 'c', 'b')
	})
})
