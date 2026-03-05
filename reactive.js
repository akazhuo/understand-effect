function reactive(target) {
  if (typeof target !== 'object' || target === null) {
    console.warn('target must be Object type');
    return target;
  }

  return new Proxy(target, {
    get(target, key, receiver) {
      const value = Reflect.get(...arguments);
      // 收集依赖
      track(target, key);
      // 值是对象，递归调用
      if (typeof value === 'object') {
        return reactive(value);
      }
      return value;
    },
    set(target, key, value, receiver) {
      const result = Reflect.set(...arguments);
      // 触发更新
      trigger(target, key);
      return result;
    },
  });
}

// 依赖收集
const targetMap = new WeakMap();
function track(target, key) {
  if (!activeEvent) return; // 没有活跃 effect，直接返回
  // 获取 target 对应的依赖 Map
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  // 获取 key 对应的依赖 Set
  let deps = depsMap.get(key);
  if (!deps) {
    deps = new Set();
    depsMap.set(key, deps);
  }
  // 将当前活跃的 effect 添加到依赖集合中
  // 防止重复注册
  if (!deps.has(activeEvent) && activeEvent) {
    deps.add(activeEvent);
  }
  // 将依赖集合添加到 effect 的 deps 中（用于 cleanup）
  activeEvent.deps.push(deps);
  console.log(`Tracking ${String(key)} on`, target);
}

// 更新触发
function trigger(target, key) {
  const depsMap = targetMap.get(target); // 找到 target 对应依赖 map
  if (!depsMap) return; // 没有依赖，直接返回

  const deps = depsMap.get(key); // 找到对应属性依赖
  if (!deps) return; // 没有依赖该属性的 effect，直接返回
  // 创建一个新的 Set 避免无限循环
  const effectsToRun = new Set(deps);

  deps.forEach((effect) => {
    // 避免重复触发当前正在执行的 effect
    if (effect !== activeEvent) {
      effectsToRun.add(effect);
    }
  });

  effectsToRun.forEach((effect) => scheduler(effect));
}
