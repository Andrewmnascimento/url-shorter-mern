const DEBUG = process.env.DEBUG || 'app:*';

export const createLogger = (namespace: string) => {
  const prefix = `[${namespace}]`;
  
  return {
    info: (message: string, data?: any) => {
      const timestamp = new Date().toISOString();
      if (data) {
        console.log(`${timestamp} ${prefix} ℹ️ ${message}`, data);
      } else {
        console.log(`${timestamp} ${prefix} ℹ️ ${message}`);
      }
    },
    
    error: (message: string, error?: any) => {
      const timestamp = new Date().toISOString();
      console.error(`${timestamp} ${prefix} ❌ ${message}`, error || '');
    },
    
    warn: (message: string, data?: any) => {
      const timestamp = new Date().toISOString();
      if (data) {
        console.warn(`${timestamp} ${prefix} ⚠️ ${message}`, data);
      } else {
        console.warn(`${timestamp} ${prefix} ⚠️ ${message}`);
      }
    },
    
    debug: (message: string, data?: any) => {
      const timestamp = new Date().toISOString();
      if (DEBUG.includes('*') || DEBUG.includes(namespace)) {
        if (data) {
          console.log(`${timestamp} ${prefix} 🐛 ${message}`, data);
        } else {
          console.log(`${timestamp} ${prefix} 🐛 ${message}`);
        }
      }
    },
    
    request: (method: string, path: string, status?: number, duration?: number) => {
      const timestamp = new Date().toISOString();
      if (status && duration) {
        const statusEmoji = status >= 400 ? '❌' : status >= 300 ? '⚠️' : '✅';
        console.log(`${timestamp} ${prefix} ${statusEmoji} ${method} ${path} - Status: ${status} (${duration}ms)`);
      } else {
        console.log(`${timestamp} ${prefix} 📡 ${method} ${path}`);
      }
    }
  };
};
