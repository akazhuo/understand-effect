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
  // 先找到 target 对应依赖
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  // 对代理对象的属性进行依赖收集
  let deps = depsMap.get(key);
  if (!deps) {
    deps = new Set();
  }
  // 防止重复注册
  if (!deps.has(activeEvent) && activeEvent) {
    deps.add(activeEvent);
  }
  depsMap.set(key, deps);
  console.log(`Tracking ${String(key)} on`, target);
}

// 更新触发
function trigger(target, key) {
  // 找到 target 对应依赖 map
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  // 找到对应属性依赖
  const deps = depsMap.get(key);
  if (!deps) return;
  // 遍历依赖集合，执行所有 effect
  const effectsToRun = new Set(deps); // 避免无限循环
  effectsToRun.forEach((effect) => effect());
}
