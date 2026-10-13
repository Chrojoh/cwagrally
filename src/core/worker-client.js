// One active search at a time. Terminating the worker also stops CPU work;
// ignoring a stale response alone would leave it blocking the next search.
export class GenerationClient {
  constructor(createWorker) {
    this.createWorker = createWorker;
    this.worker = null;
    this.pending = null;
    this.requestId = 0;
  }

  cancel() {
    if (!this.pending) return;
    const pending = this.pending;
    this.pending = null;
    this.worker?.terminate();
    this.worker = null;
    const error = new Error('Course search cancelled.');
    error.name = 'AbortError';
    pending.reject(error);
  }

  run(packId, options, operation = 'generate') {
    this.cancel();
    if (!this.worker) {
      const worker = this.createWorker();
      this.worker = worker;
      worker.onmessage = ({data}) => {
        if (this.worker !== worker || data.id !== this.pending?.id) return;
        const pending = this.pending;
        this.pending = null;
        data.error ? pending.reject(new Error(data.error)) : pending.resolve(data.result ?? data.course);
      };
      worker.onerror = () => {
        if (this.worker !== worker) return;
        const pending = this.pending;
        this.pending = null;
        worker.terminate();
        this.worker = null;
        pending?.reject(new Error('Course generation could not start. Serve this folder over HTTP and try again.'));
      };
    }
    const id = ++this.requestId;
    return new Promise((resolve, reject) => {
      this.pending = {id, resolve, reject};
      try { this.worker.postMessage({id, packId, options, operation}); }
      catch (error) {
        this.pending = null;
        this.worker.terminate();
        this.worker = null;
        reject(error);
      }
    });
  }
}
