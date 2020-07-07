const isEmpty = (target: any): boolean => {
  return [Object, Array].includes((target || {}).constructor) && !Object.entries(target || {}).length
}

export default isEmpty
