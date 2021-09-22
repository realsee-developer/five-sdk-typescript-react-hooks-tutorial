import { State } from "@realsee/five";

/**
 * 录制类
 */
class Recorder {
  private records: { state: State, time: number }[] | null = null;
  private startTime: number;
  constructor() {
    this.startTime = 0;
    this.records = null;
  }
  /**
   * 是否已录制
   */
  hasRecords() {
    return this.records !== null;
  }
  /**
   * 录制关键帧
   * @param state five 的 state
   * @returns
   */
  record(state: State) {
    if (this.records === null) return;
    console.log(state);
    this.records.push({
      state: Object.assign({}, state),
      time: Date.now() - this.startTime
    });
  }
  /**
   * 开始录制
   */
  startRecording() {
    this.startTime = Date.now();
    this.records = [];
  }
  /**
   * 结束录制
   */
  endRecording() {
    this.startTime = 0;
  }
  /**
   * 回放录制
   * @param callback 关键帧回调
   * @returns 当前是否有录制
   */
  play(callback: (state: State, isFinal: boolean) => void) {
    if (this.records === null || this.records.length === 0) return false;
    const records = this.records.slice();
    const keyframe = (keyIndex: number) => {
      const current = records[keyIndex];
      const next = records[keyIndex + 1];
      callback(current.state, next === undefined);
      if (next) {
        const delay = next.time - current.time;
        setTimeout(() => keyframe(keyIndex + 1), delay);
      }
    }
    keyframe(0);
    return true;
  }
}

export { Recorder };