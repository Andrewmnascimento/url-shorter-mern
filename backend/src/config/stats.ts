export class cacheStats {
  hits: number;
  misses: number;
  startTime: Date;

  constructor(){
    this.hits = 0,
    this.misses = 0,
    this.startTime = new Date()
  };

  recordHit(){
    this.hits++;
  }

  recordMisses(){
    this.misses++;
  }

  getMetrics() {
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: this.hits / (this.hits + this.misses) || 0,
      uptime: Date.now() - this.startTime.getTime(),
      timestamp: new Date()
    };
  }

  reset() {
    this.hits = 0;
    this.misses = 0;
    this.startTime = new Date();
  }
}