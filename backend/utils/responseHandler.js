class ResponseHandler {
    success(res, data, message = 'Success', statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
            timestamp: new Date().toISOString()
        });
    }

    error(res, message = 'Error occurred', statusCode = 500, errors = null) {
        const response = {
            success: false,
            message,
            timestamp: new Date().toISOString()
        };
        if (errors) {
            response.errors = errors;
        }
        return res.status(statusCode).json(response);
    }

    created(res, data, message = 'Created successfully') {
        return this.success(res, data, message, 201);
    }

    accepted(res, data, message = 'Request accepted') {
        return this.success(res, data, message, 202);
    }

    noContent(res, message = 'No content') {
        return res.status(204).json({
            success: true,
            message,
            timestamp: new Date().toISOString()
        });
    }

    notFound(res, message = 'Resource not found') {
        return this.error(res, message, 404);
    }

    badRequest(res, message = 'Bad request', errors = null) {
        return this.error(res, message, 400, errors);
    }

    unauthorized(res, message = 'Unauthorized') {
        return this.error(res, message, 401);
    }

    forbidden(res, message = 'Forbidden') {
        return this.error(res, message, 403);
    }

    conflict(res, message = 'Conflict', errors = null) {
        return this.error(res, message, 409, errors);
    }

    validationError(res, errors) {
        return this.error(res, 'Validation failed', 400, errors);
    }

    serverError(res, message = 'Internal server error') {
        return this.error(res, message, 500);
    }

    serviceUnavailable(res, message = 'Service unavailable') {
        return this.error(res, message, 503);
    }

    // Paginated response
    paginated(res, data, total, page, limit, message = 'Success') {
        const totalPages = Math.ceil(total / limit);
        return res.status(200).json({
            success: true,
            message,
            data,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            },
            timestamp: new Date().toISOString()
        });
    }

    // Bulk operation response
    bulkOperation(res, successCount, failedCount, errors = null, message = 'Bulk operation completed') {
        const response = {
            success: true,
            message,
            successCount,
            failedCount,
            timestamp: new Date().toISOString()
        };
        if (errors) {
            response.errors = errors;
        }
        return res.status(200).json(response);
    }

    // File response
    file(res, file, filename, contentType = 'application/octet-stream') {
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', file.length);
        return res.send(file);
    }

    // Streaming response
    stream(res, stream, contentType = 'application/octet-stream') {
        res.setHeader('Content-Type', contentType);
        return stream.pipe(res);
    }
}

module.exports = new ResponseHandler();