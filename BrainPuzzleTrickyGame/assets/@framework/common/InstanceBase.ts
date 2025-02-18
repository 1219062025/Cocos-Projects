/** 继承单例（类型安全） */
abstract class InstanceBase {
  /** 单例方法 */
  static instance<T extends new (...args_as: any[]) => any>(
    this: T,
    ...args_as_: ConstructorParameters<T>
  ): InstanceType<T> {
    const self = this as any;

    if (!self._instance) {
      self._instance = new self(...args_as_);
    }

    return self._instance;
  }
}

export default InstanceBase;
