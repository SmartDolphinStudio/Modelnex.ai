/**
 * 桌宠「活动状态」的全局共享 store（模块级单例，发布-订阅）。
 *
 * 用途：聊天浮层 `PetChatPanel` 与 `/chat` 页面把用户/助手正在做的事写入这里
 * （用户输入 `typing`、等待回复 `thinking`、检索 `searching`、助手输出
 * `writing`），空闲时写回 `idle`；`ChatPet` 订阅后据此驱动团子切换到
 * 「睁大眼检索 / 三个点思考」等状态。
 *
 * 纯 TS、无 React、无 DOM，因此页面组件与桌宠容器之间完全解耦，
 * 谁挂载、谁激活都不影响状态读取。
 */
export type PetActivity =
  | 'idle'
  | 'typing'
  | 'thinking'
  | 'searching'
  | 'writing'

let current: PetActivity = 'idle'
const listeners = new Set<(activity: PetActivity) => void>()

function emit(activity: PetActivity): void {
  listeners.forEach((listener) => listener(activity))
}

export const petActivityStore = {
  /** 当前活动状态。 */
  get current(): PetActivity {
    return current
  },

  /** 更新活动状态；值未变化时不触发订阅者。 */
  set(activity: PetActivity): void {
    if (activity === current) return
    current = activity
    emit(activity)
  },

  /**
   * 订阅活动状态变化。
   * @returns 取消订阅函数。
   */
  subscribe(listener: (activity: PetActivity) => void): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
}
