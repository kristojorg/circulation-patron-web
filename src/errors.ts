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
  authDocument?: OPDS1.AuthDocument;
};
export class ServerError extends ApplicationError {
  // a default problem document
  info: ProblemDocument = {
    detail: "An unknown error server occurred.",
    status: 500,
    title: "Server Error"
  };

  constructor(url: string, response: Response) {
    super("Server Error");
    Object.setPrototypeOf(this, ServerError.prototype);
    response
      .json()
      .then((problem: ProblemDocument | OPDS1.AuthDocument) => {
        if (response.status === 401) {
          // we get back an auth document instead of problem document
          // we will construct our own problem document.
          this.info = {
            status: 401,
            title: "No Authorized",
            detail: "You are not authorized for the requested resource.",
            authDocument: problem
          };
        }
        this.info = problem;
      })
      .catch(e => {
        // the problem could not be parsed as json. Continue.
        this.info.detail =
          "The server error document could not be parsed as json.";
        console.error("The server error could not be parsed.", e);
      });
  }
}
