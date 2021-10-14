# Decorator for `willSet` and `didSet`

Class decorators to listen to member assignments before and after they occur.

## Instalação

NPM: https://www.npmjs.com/package/will-did-set-decorator

## willSet

```typescript
function willSet(handler: (newValue: any) => void): PropertyDecorator
```

Attach a handler that will be executed just before the property is modified. The order of calls is from subclass to superclass. That is, if the class `A` has a `foo` property decorated with `willSet` and the subclass `B` decorates the same property with `willSet`, first `B.willSet` will be called, after `A.willSet`.

- `handler`: Function called with the new value (the value after assignment).

### Example:

```typescript
class SuperClass {
  @willSet(function(this: SuperClass, newValue: string) {
    console.log('SuperClass', this.prop, newValue)
  })
  public prop?: number
}

class SubClass extends SuperClass {
  @willSet(function(this: SubClass, newValue: string) {
    console.log('SubClass', this.prop, newValue)
  })
  public override prop?: number
}

const clazz = new SubClass()
// Calls `SubClass.willSet()`, then `SuperClass.willSet()`
clazz.prop = 42
/*
 * Log order:
 * 1 - 'SubClass', undefined, 42
 * 2 - 'SuperClass', undefined, 42
 */
```

## didSet

```typescript
function didSet(handler: (oldValue: any) => void): PropertyDecorator
```

Attach a handler that will be executed just after the property is modified. The order of calls is from superclass to subclass. That is, if the class `A` has a `foo` property decorated with `didSet` and the subclass `B` decorates the same property with `didSet`, first `A.didSet` will be called, after `B.didSet`.
- `handler`: handler Function called with the old value (the value before assignment - undefined in the first call).

### Example:

```typescript
class SuperClass {
  @didSet(function(this: SuperClass, oldValue: string) {
    console.log('SuperClass', this.prop, oldValue)
  })
  public prop?: number
}

class SubClass extends SuperClass {
  @didSet(function(this: SubClass, oldValue: string) {
    console.log('SubClass', this.prop, oldValue)
  })
  public override prop?: number
}

const clazz = new SubClass()
// Calls `SuperClass.didSet()`, then `SubClass.didSet()`
clazz.prop = 42
/*
 * Log order:
 * 1 - 'SuperClass', 42, undefined
 * 2 - 'SubClass', 42, undefined
 */
```
