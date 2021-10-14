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
			public prop = 'super'
		}

		class InterClass extends SuperClass {}

		class SubClass extends InterClass {
			@willSet(function(this: SubClass, newValue: string) {
				check(this, SubClass, this.prop, newValue)
			})
			public override prop = 'sub'
		}

		const superClass = new SuperClass()

		expect(check).toBeCalledTimes(1)
		expect(check).toBeCalledWith(superClass, SuperClass, undefined, 'super')

		check.mockClear()

		const subClass = new SubClass()

		expect(check).toBeCalledTimes(4)

		expect(check).nthCalledWith(1, subClass, SubClass, undefined, 'super')
		expect(check).nthCalledWith(2, subClass, SuperClass, undefined, 'super')

		expect(check).nthCalledWith(3, subClass, SubClass, 'super', 'sub')
		expect(check).nthCalledWith(4, subClass, SuperClass, 'super', 'sub')
	})

	it('calls in the correct order when overriding with key of type symbol', () => {
		const prop = Symbol()

		class SuperClass {
			@willSet(function(this: SuperClass, newValue: string) {
				check(this, SuperClass, this[prop], newValue)
			})
			public [prop] = 'super'
		}

		class InterClass extends SuperClass {}

		class SubClass extends InterClass {
			@willSet(function(this: SubClass, newValue: string) {
				check(this, SubClass, this[prop], newValue)
			})
			public override [prop] = 'sub'
		}

		const superClass = new SuperClass()

		expect(check).toBeCalledTimes(1)
		expect(check).toBeCalledWith(superClass, SuperClass, undefined, 'super')

		check.mockClear()

		const subClass = new SubClass()

		expect(check).toBeCalledTimes(4)

		expect(check).nthCalledWith(1, subClass, SubClass, undefined, 'super')
		expect(check).nthCalledWith(2, subClass, SuperClass, undefined, 'super')

		expect(check).nthCalledWith(3, subClass, SubClass, 'super', 'sub')
		expect(check).nthCalledWith(4, subClass, SuperClass, 'super', 'sub')
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
			public prop = 'super'
		}

		class InterClass extends SuperClass {}

		class SubClass extends InterClass {
			@didSet(function(this: SubClass, oldValue: string) {
				check(this, SubClass, this.prop, oldValue)
			})
			public override prop = 'sub'
		}

		const superClass = new SuperClass()

		expect(check).toBeCalledTimes(1)
		expect(check).toBeCalledWith(superClass, SuperClass, 'super', undefined)

		check.mockClear()

		const subClass = new SubClass()

		expect(check).toBeCalledTimes(4)

		expect(check).nthCalledWith(1, subClass, SuperClass, 'super', undefined)
		expect(check).nthCalledWith(2, subClass, SubClass, 'super', undefined)

		expect(check).nthCalledWith(3, subClass, SuperClass, 'sub', 'super')
		expect(check).nthCalledWith(4, subClass, SubClass, 'sub', 'super')
	})

	it('calls in the correct order when overriding with key of type symbol', () => {
		const prop = Symbol()

		class SuperClass {
			@didSet(function(this: SuperClass, oldValue: string) {
				check(this, SuperClass, this[prop], oldValue)
			})
			public [prop] = 'super'
		}

		class InterClass extends SuperClass {}

		class SubClass extends InterClass {
			@didSet(function(this: SubClass, oldValue: string) {
				check(this, SubClass, this[prop], oldValue)
			})
			public override [prop] = 'sub'
		}

		const superClass = new SuperClass()

		expect(check).toBeCalledTimes(1)
		expect(check).toBeCalledWith(superClass, SuperClass, 'super', undefined)

		check.mockClear()

		const subClass = new SubClass()

		expect(check).toBeCalledTimes(4)

		expect(check).nthCalledWith(1, subClass, SuperClass, 'super', undefined)
		expect(check).nthCalledWith(2, subClass, SubClass, 'super', undefined)

		expect(check).nthCalledWith(3, subClass, SuperClass, 'sub', 'super')
		expect(check).nthCalledWith(4, subClass, SubClass, 'sub', 'super')
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
			public prop = 'super'
		}

		class InterClass extends SuperClass {}

		class SubClass extends InterClass {
			@willSet(function(this: SubClass, newValue: string) {
				check(this, 'will', SubClass, this.prop, newValue)
			})
			@didSet(function(this: SubClass, oldValue: string) {
				check(this, 'did', SubClass, this.prop, oldValue)
			})
			public override prop = 'sub'
		}

		const superClass = new SuperClass()

		expect(check).toBeCalledTimes(2)

		expect(check).nthCalledWith(1, superClass, 'will', SuperClass, undefined, 'super')
		expect(check).nthCalledWith(2, superClass, 'did', SuperClass, 'super', undefined)

		check.mockClear()

		const subClass = new SubClass()

		expect(check).toBeCalledTimes(8)

		expect(check).nthCalledWith(1, subClass, 'will', SubClass, undefined, 'super')
		expect(check).nthCalledWith(2, subClass, 'will', SuperClass, undefined, 'super')
		expect(check).nthCalledWith(3, subClass, 'did', SuperClass, 'super', undefined)
		expect(check).nthCalledWith(4, subClass, 'did', SubClass, 'super', undefined)

		expect(check).nthCalledWith(5, subClass, 'will', SubClass, 'super', 'sub')
		expect(check).nthCalledWith(6, subClass, 'will', SuperClass, 'super', 'sub')
		expect(check).nthCalledWith(7, subClass, 'did', SuperClass, 'sub', 'super')
		expect(check).nthCalledWith(8, subClass, 'did', SubClass, 'sub', 'super')
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
			public [prop] = 'super'
		}

		class InterClass extends SuperClass {}

		class SubClass extends InterClass {
			@willSet(function(this: SubClass, newValue: string) {
				check(this, 'will', SubClass, this[prop], newValue)
			})
			@didSet(function(this: SubClass, oldValue: string) {
				check(this, 'did', SubClass, this[prop], oldValue)
			})
			public override [prop] = 'sub'
		}

		const superClass = new SuperClass()

		expect(check).toBeCalledTimes(2)

		expect(check).nthCalledWith(1, superClass, 'will', SuperClass, undefined, 'super')
		expect(check).nthCalledWith(2, superClass, 'did', SuperClass, 'super', undefined)

		check.mockClear()

		const subClass = new SubClass()

		expect(check).toBeCalledTimes(8)

		expect(check).nthCalledWith(1, subClass, 'will', SubClass, undefined, 'super')
		expect(check).nthCalledWith(2, subClass, 'will', SuperClass, undefined, 'super')
		expect(check).nthCalledWith(3, subClass, 'did', SuperClass, 'super', undefined)
		expect(check).nthCalledWith(4, subClass, 'did', SubClass, 'super', undefined)

		expect(check).nthCalledWith(5, subClass, 'will', SubClass, 'super', 'sub')
		expect(check).nthCalledWith(6, subClass, 'will', SuperClass, 'super', 'sub')
		expect(check).nthCalledWith(7, subClass, 'did', SuperClass, 'sub', 'super')
		expect(check).nthCalledWith(8, subClass, 'did', SubClass, 'sub', 'super')
	})

	it('handles asymmetric overwrite with key of type string', () => {
		class SuperClass {
			@willSet(function(this: SuperClass, newValue: string) {
				check(this, 'will', SuperClass, this.prop, newValue)
			})
			@didSet(function(this: SuperClass, oldValue: string) {
				check(this, 'did', SuperClass, this.prop, oldValue)
			})
			public prop = 'super'
		}

		class SubWill extends SuperClass {
			@willSet(function(this: SubWill, newValue: string) {
				check(this, 'will', SubWill, this.prop, newValue)
			})
			public override prop = 'subWill'
		}

		const subWill = new SubWill()

		expect(check).toBeCalledTimes(6)

		expect(check).nthCalledWith(1, subWill, 'will', SubWill, undefined, 'super')
		expect(check).nthCalledWith(2, subWill, 'will', SuperClass, undefined, 'super')
		expect(check).nthCalledWith(3, subWill, 'did', SuperClass, 'super', undefined)

		expect(check).nthCalledWith(4, subWill, 'will', SubWill, 'super', 'subWill')
		expect(check).nthCalledWith(5, subWill, 'will', SuperClass, 'super', 'subWill')
		expect(check).nthCalledWith(6, subWill, 'did', SuperClass, 'subWill', 'super')

		check.mockClear()

		class SubDid extends SuperClass {
			@didSet(function(this: SubDid, oldValue) {
				check(this, 'did', SubDid, this.prop, oldValue)
			})
			public override prop = 'subDid'
		}

		const subDid = new SubDid()

		expect(check).toBeCalledTimes(6)

		expect(check).nthCalledWith(1, subDid, 'will', SuperClass, undefined, 'super')
		expect(check).nthCalledWith(2, subDid, 'did', SuperClass, 'super', undefined)
		expect(check).nthCalledWith(3, subDid, 'did', SubDid, 'super', undefined)

		expect(check).nthCalledWith(4, subDid, 'will', SuperClass, 'super', 'subDid')
		expect(check).nthCalledWith(5, subDid, 'did', SuperClass, 'subDid', 'super')
		expect(check).nthCalledWith(6, subDid, 'did', SubDid, 'subDid', 'super')
	})

	it('handles asymmetric overwrite with key of type symbol', () => {
		const prop = Symbol()

		class SuperClass {
			@willSet(function(this: SuperClass, newValue: string) {
				check(this, 'will', SuperClass, this[prop], newValue)
			})
			@didSet(function(this: SuperClass, oldValue: string) {
				check(this, 'did', SuperClass, this[prop], oldValue)
			})
			public [prop] = 'super'
		}

		class SubWill extends SuperClass {
			@willSet(function(this: SubWill, newValue: string) {
				check(this, 'will', SubWill, this[prop], newValue)
			})
			public override [prop] = 'subWill'
		}

		const subWill = new SubWill()

		expect(check).toBeCalledTimes(6)

		expect(check).nthCalledWith(1, subWill, 'will', SubWill, undefined, 'super')
		expect(check).nthCalledWith(2, subWill, 'will', SuperClass, undefined, 'super')
		expect(check).nthCalledWith(3, subWill, 'did', SuperClass, 'super', undefined)

		expect(check).nthCalledWith(4, subWill, 'will', SubWill, 'super', 'subWill')
		expect(check).nthCalledWith(5, subWill, 'will', SuperClass, 'super', 'subWill')
		expect(check).nthCalledWith(6, subWill, 'did', SuperClass, 'subWill', 'super')

		check.mockClear()

		class SubDid extends SuperClass {
			@didSet(function(this: SubDid, oldValue) {
				check(this, 'did', SubDid, this[prop], oldValue)
			})
			public override [prop] = 'subDid'
		}

		const subDid = new SubDid()

		expect(check).toBeCalledTimes(6)

		expect(check).nthCalledWith(1, subDid, 'will', SuperClass, undefined, 'super')
		expect(check).nthCalledWith(2, subDid, 'did', SuperClass, 'super', undefined)
		expect(check).nthCalledWith(3, subDid, 'did', SubDid, 'super', undefined)

		expect(check).nthCalledWith(4, subDid, 'will', SuperClass, 'super', 'subDid')
		expect(check).nthCalledWith(5, subDid, 'did', SuperClass, 'subDid', 'super')
		expect(check).nthCalledWith(6, subDid, 'did', SubDid, 'subDid', 'super')
	})
})
