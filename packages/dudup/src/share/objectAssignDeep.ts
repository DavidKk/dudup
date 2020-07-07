type AssignDeepObject = {
  [key: string]: any
}

type AssignDeepOptions = {
  arrayBehaviour?: 'merge' | 'replace'
}

function getTypeOf(target: any): string {
  if (target === null) {
    return 'null'
  }

  if (typeof target === 'undefined') {
    return 'undefined'
  }

  if (typeof target === 'object') {
    return Array.isArray(target) ? 'array' : 'object'
  }

  return typeof target
}

function cloneValue<T>(target: T): T {
  if (getTypeOf(target) === 'object') {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return quickCloneObject(target)
  }

  if (getTypeOf(target) === 'array') {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return quickCloneArray(target)
  }

  return target
}

function quickCloneArray(target: any) {
  return target.map(cloneValue)
}

function quickCloneObject<T extends { [key: string]: any }>(target: T): T {
  const output = {} as T
  for (const key in target) {
    if (!target.hasOwnProperty(key)) {
      continue
    }

    output[key] = cloneValue(target[key])
  }

  return output
}

function mergeDeep<T extends AssignDeepObject>(target: T, objects: T[], options: AssignDeepOptions = { arrayBehaviour: 'replace' }): T {
  const fullObjects = objects.map((item) => item || {})
  const output = target || {}

  for (let i = 0; i < fullObjects.length; i++) {
    const object = fullObjects[i]
    const keys = Object.keys(object)

    for (let j = 0; j < keys.length; j++) {
      const key = keys[j]
      const value = object[key]
      const type = getTypeOf(value)
      const existingValueType = getTypeOf(output[key])

      if (type === 'object') {
        if (existingValueType !== 'undefined') {
          const existingValue = existingValueType === 'object' ? output[key] : {}
          output[key] = mergeDeep({}, [existingValue, quickCloneObject(value)], options)
        } else {
          output[key] = quickCloneObject(value)
        }
      } else if (type === 'array') {
        if (existingValueType === 'array') {
          const newValue = quickCloneArray(value)
          output[key] = options.arrayBehaviour === 'merge' ? output[key].concat(newValue) : newValue
        } else {
          output[key] = quickCloneArray(value)
        }
      } else {
        output[key] = value
      }
    }
  }

  return output as T
}

function objectAssignDeep(target: AssignDeepObject, ...objects: AssignDeepObject[]) {
  return mergeDeep(target, objects)
}

export default objectAssignDeep
