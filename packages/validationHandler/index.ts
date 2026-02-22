import { BadRequestError } from '@souqify/errorHandler/index.js';
import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

export type ValidationSource = 'body' | 'query' | 'params';

export type ValidationSchemas = {
  body?: z.ZodTypeAny;
  query?: z.ZodTypeAny;
  params?: z.ZodTypeAny;
};

function formatZodMessage(error: z.ZodError): string {
  const parts = error.issues.map((issue: z.ZodIssue) => {
    const path = issue.path.length ? issue.path.join('.') : 'value';
    return `${path}: ${issue.message}`;
  });
  return parts.join('; ');
}

export const validationHandler = (schemas: ValidationSchemas) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.query = (await schemas.query.parseAsync(req.query)) as Request['query'];
      }
      if (schemas.params) {
        req.params = (await schemas.params.parseAsync(req.params)) as Request['params'];
      }
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(BadRequestError.validationError(formatZodMessage(error)));
      } else {
        next(error);
      }
    }
  };
};
