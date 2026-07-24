const fs = require('fs');
const path = require('path');

class LoggerService {
    constructor() {
        this.logDir = path.join(__dirname, '../logs');
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
        
        // Create sub-directories for different log types
        this.errorLogDir = path.join(this.logDir, 'errors');
        this.activityLogDir = path.join(this.logDir, 'activities');
        this.requestLogDir = path.join(this.logDir, 'requests');
        
        [this.errorLogDir, this.activityLogDir, this.requestLogDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    getLogFileName(type = 'general') {
        const date = new Date().toISOString().split('T')[0];
        return path.join(this.logDir, `${type}_${date}.log`);
    }

    getErrorLogFileName() {
        const date = new Date().toISOString().split('T')[0];
        return path.join(this.errorLogDir, `error_${date}.log`);
    }

    getActivityLogFileName() {
        const date = new Date().toISOString().split('T')[0];
        return path.join(this.activityLogDir, `activity_${date}.log`);
    }

    getRequestLogFileName() {
        const date = new Date().toISOString().split('T')[0];
        return path.join(this.requestLogDir, `request_${date}.log`);
    }

    log(message, level = 'INFO', type = 'general') {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [${level}] ${message}\n`;
        
        // Console output
        const consoleMethod = level === 'ERROR' ? 'error' : 
                             level === 'WARN' ? 'warn' : 
                             level === 'DEBUG' ? 'debug' : 'log';
        console[consoleMethod](logEntry.trim());

        // File output
        let logFile;
        switch(type) {
            case 'error':
                logFile = this.getErrorLogFileName();
                break;
            case 'activity':
                logFile = this.getActivityLogFileName();
                break;
            case 'request':
                logFile = this.getRequestLogFileName();
                break;
            default:
                logFile = this.getLogFileName();
        }
        
        try {
            fs.appendFileSync(logFile, logEntry);
        } catch (err) {
            console.error('Failed to write log file:', err);
        }
    }

    info(message) {
        this.log(message, 'INFO');
    }

    error(message) {
        this.log(message, 'ERROR', 'error');
    }

    warn(message) {
        this.log(message, 'WARN');
    }

    debug(message) {
        this.log(message, 'DEBUG');
    }

    logActivity(activity) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            ...activity
        };
        this.log(JSON.stringify(logEntry), 'INFO', 'activity');
    }

    logRequest(req) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.url,
            ip: req.ip,
            userAgent: req.get('user-agent'),
            userId: req.user?.id || 'anonymous'
        };
        this.log(JSON.stringify(logEntry), 'DEBUG', 'request');
    }

    logResponse(req, res, responseTime) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            responseTime: `${responseTime}ms`,
            userId: req.user?.id || 'anonymous'
        };
        this.log(JSON.stringify(logEntry), 'INFO', 'request');
    }

    logError(error, req = null) {
        const errorLog = {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            type: error.name || 'Error'
        };
        
        if (req) {
            errorLog.request = {
                method: req.method,
                url: req.url,
                body: req.body,
                params: req.params,
                query: req.query,
                ip: req.ip,
                userId: req.user?.id || 'anonymous'
            };
        }
        
        this.log(JSON.stringify(errorLog), 'ERROR', 'error');
    }

    logSecurityEvent(event, details = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            event: event,
            details: details,
            ip: details.ip || 'unknown'
        };
        this.log(JSON.stringify(logEntry), 'WARN', 'activity');
    }

    logDatabaseQuery(query, params = [], duration = 0) {
        if (process.env.NODE_ENV === 'development') {
            const logEntry = {
                timestamp: new Date().toISOString(),
                query: query,
                params: params,
                duration: `${duration}ms`
            };
            this.log(JSON.stringify(logEntry), 'DEBUG');
        }
    }

    getLogs(type = 'general', date = null) {
        const dateStr = date || new Date().toISOString().split('T')[0];
        let logFile;
        
        switch(type) {
            case 'error':
                logFile = path.join(this.errorLogDir, `error_${dateStr}.log`);
                break;
            case 'activity':
                logFile = path.join(this.activityLogDir, `activity_${dateStr}.log`);
                break;
            case 'request':
                logFile = path.join(this.requestLogDir, `request_${dateStr}.log`);
                break;
            default:
                logFile = path.join(this.logDir, `${type}_${dateStr}.log`);
        }

        try {
            if (fs.existsSync(logFile)) {
                const content = fs.readFileSync(logFile, 'utf8');
                return content.split('\n').filter(line => line.trim());
            }
            return [];
        } catch (err) {
            console.error('Failed to read log file:', err);
            return [];
        }
    }

    clearOldLogs(days = 30) {
        const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
        const directories = [this.logDir, this.errorLogDir, this.activityLogDir, this.requestLogDir];
        
        directories.forEach(dir => {
            try {
                const files = fs.readdirSync(dir);
                files.forEach(file => {
                    const filePath = path.join(dir, file);
                    const stats = fs.statSync(filePath);
                    if (stats.isFile() && stats.mtimeMs < cutoff) {
                        fs.unlinkSync(filePath);
                        console.log(`Deleted old log file: ${filePath}`);
                    }
                });
            } catch (err) {
                console.error('Failed to clean logs:', err);
            }
        });
    }
}

module.exports = new LoggerService();