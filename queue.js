let isFlushing = false; // 是否正在刷新队列
const queue = new Set(); // 任务队列

function flushQueue() {
  if (isFlushing) return; // 如果正在刷新队列，直接返回
  isFlushing = true;

  // 创建一个新的 set 避免无限循环
  const effectsToRun = new Set(queue);
  queue.clear(); // 清空队列

  // 执行所有任务
  effectsToRun.forEach((effect) => effect());
  isFlushing = false; // 标记为刷新完成
}

function scheduler(effect) {
  queue.add(effect); // 将副作用函数加入队列
  Promise.resolve().then(flushQueue); // 使用微任务延迟执行
}
