let activeEvent = null; // 当前活跃 effect
const effectStack = []; // effect 栈
// 副作用函数
function effect(fn) {
  const effectFn = () => {
    activeEvent = effectFn; // 标记当前活跃 effect
    effectStack.push(effectFn); // 推入栈
    try {
      fn(); // 执行副作用函数
    } finally {
      effectStack.pop(); // 执行完毕弹出栈
      activeEvent = effectStack[effectStack.length - 1]; // 恢复上一个 effect
    }
  };
  effectFn.deps = []; // 存储该 effect 依赖的集合
  effectFn(); // 立即执行一次
}
