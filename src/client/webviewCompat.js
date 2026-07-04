function defineArrayMethod(name, implementation) {
  if (typeof Array.prototype[name] === 'function') return;
  Object.defineProperty(Array.prototype, name, {
    value: implementation,
    writable: true,
    configurable: true
  });
}

defineArrayMethod('findLast', function findLast(predicate, thisArg) {
  if (this == null) throw new TypeError('Array.prototype.findLast called on null or undefined');
  if (typeof predicate !== 'function') throw new TypeError('predicate must be a function');
  const array = Object(this);
  const length = array.length >>> 0;
  for (let index = length - 1; index >= 0; index -= 1) {
    const value = array[index];
    if (predicate.call(thisArg, value, index, array)) return value;
  }
  return undefined;
});

defineArrayMethod('findLastIndex', function findLastIndex(predicate, thisArg) {
  if (this == null) throw new TypeError('Array.prototype.findLastIndex called on null or undefined');
  if (typeof predicate !== 'function') throw new TypeError('predicate must be a function');
  const array = Object(this);
  const length = array.length >>> 0;
  for (let index = length - 1; index >= 0; index -= 1) {
    if (predicate.call(thisArg, array[index], index, array)) return index;
  }
  return -1;
});
