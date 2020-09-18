import { OPDS1 } from "interfaces";

export default class ApplicationError extends Error {
  readonly statusCode: number | null = null;

  constructor(m: string, baseError?: Error) {
    super(`${m}${baseError ? `\nBase Error:\n${baseError.message}` : ""}`);
    Object.setPrototypeOf(this, ApplicationError.prototype);
    this.name = "Application Error";
  }
}

export class PageNotFoundError extends ApplicationError {
  readonly statusCode = 404;

  constructor(m: string, baseError?: Error) {
    super(`${m}${baseError ? baseError.message : ""}`);
    Object.setPrototypeOf(this, PageNotFoundError.prototype);
    this.name = "Page Not Found Error";
  }
}

export class UnimplementedError extends ApplicationError {
  constructor(m: string, baseError?: Error) {
    super(`${m}${baseError ? baseError.message : ""}`);
    Object.setPrototypeOf(this, UnimplementedError.prototype);
    this.name = "Unimplemented Error";
  }
}

export class AppSetupError extends ApplicationError {
  readonly statusCode = 500;

  constructor(m: string, baseError?: Error) {
    super(`${m}${baseError ? baseError.message : ""}`);
    Object.setPrototypeOf(this, AppSetupError.prototype);
    this.name = "App Setup Error";
  }
}

type ProblemDocument = {
  detail: string;
  status: number;
  title: string;
  type?: string;
};

type InvalidCredentialsType = "http://librarysimplified.org/terms/problem/credentials-invalid";

type ErrorType = "invalid-credentials" | "other";

function isProblemDocument(
  details: ProblemDocument | OPDS1.AuthDocument
): details is ProblemDocument {
  return !(typeof (details as OPDS1.AuthDocument).id === "string");
}
export class ServerError extends ApplicationError {
  // a default problem document
  url: string;
  info: ProblemDocument = {
    detail: "An unknown error server occurred.",
    status: 500,
    title: "Server Error"
  };
  authDocument?: OPDS1.AuthDocument;

  constructor(
    url: string,
    status: number,
    details: ProblemDocument | OPDS1.AuthDocument
  ) {
    super("Server Error");
    this.url = url;
    Object.setPrototypeOf(this, ServerError.prototype);
    if (status === 401 && !isProblemDocument(details)) {
      // we get back an auth document instead of problem document
      // we will construct our own problem document.
      this.info = {
        status: 401,
        title: "No Authorized",
        detail: "You are not authorized for the requested resource."
      };
      this.authDocument = details;
    } else if (isProblemDocument(details)) {
      this.info = details;
    }
  }
}
