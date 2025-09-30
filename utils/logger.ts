export interface LogData {
  [key: string]: any;
}

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  private formatMessage(level: LogLevel, message: string, data?: LogData): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    return data ? `${prefix} ${message} ${JSON.stringify(data)}` : `${prefix} ${message}`;
  }

  debug(message: string, data?: LogData): void {
    if (this.isDevelopment) {
      console.log(this.formatMessage(LogLevel.DEBUG, message, data));
    }
  }

  info(message: string, data?: LogData): void {
    if (this.isDevelopment) {
      console.log(this.formatMessage(LogLevel.INFO, message, data));
    }
  }

  warn(message: string, data?: LogData): void {
    console.warn(this.formatMessage(LogLevel.WARN, message, data));
  }

  error(message: string, error?: any, data?: LogData): void {
    const errorData = error instanceof Error 
      ? { message: error.message, stack: error.stack, ...data }
      : { error, ...data };
    
    console.error(this.formatMessage(LogLevel.ERROR, message, errorData));
    
    // En producción, aquí podrías enviar a un servicio de logging externo
    if (this.isProduction) {
      // TODO: Integrar con servicio de logging (Sentry, LogRocket, etc.)
    }
  }

  // Método especial para tracking de performance
  performance(operation: string, startTime: number, data?: LogData): void {
    const duration = Date.now() - startTime;
    this.info(`Performance: ${operation} completed in ${duration}ms`, data);
  }
}

export const logger = new Logger();