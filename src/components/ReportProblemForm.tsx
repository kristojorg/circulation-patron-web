import * as React from "react";

export interface  ReportProblemFormProps {
  reportUrl: string;
  report: (url: string) => Promise<any>;
  fetchTypes: (url: string) => Promise<string[]>;
  close: () => void;
  types: string[];
}

export default class ReportProblemForm extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      submitted: false,
      error: null
    };
    this.submit = this.submit.bind(this);
  }

  render() {
    let title = this.state.submitted ? "Problem Reported" : "Report a Problem";

    return (
      <div className="problem-form">
        <h3>{title}</h3>

        { this.state.error &&
          <div
            className="error">
            {this.state.error}
          </div>
        }

        { !this.state.submitted && this.props.types.length > 0 &&
          <div className="form">
            <select
              className="form-control"
              ref="type">
              <option value="">choose a type</option>
              { this.props.types.map(type =>
                <option key={type} value={type}>{this.displayType(type)}</option>
              ) }
            </select>
            <br />
            <textarea
              className="form-control"
              placeholder="details"
              ref="detail">
            </textarea>
            <br />
            <button className="btn btn-default" onClick={this.submit}>Submit</button>
            &nbsp;
            <button className="btn btn-default" onClick={this.props.close}>Cancel</button>
          </div>
        }

        { this.state.submitted &&
          <div className="submitted">
            <button className="btn btn-default" onClick={this.props.close}>Close</button>
          </div>
        }
      </div>
    );
  }

  componentWillMount() {
    this.props.fetchTypes(this.props.reportUrl);
  }

  displayType(type) {
    return type
      .replace("http://librarysimplified.org/terms/problem/", "")
      .replace(/-/g, " ")
      .split(" ")
      .map(t => t[0].toUpperCase() + t.slice(1))
      .join(" ");
  }

  submit() {
    if (this.typeSelected()) {
      let data = {
        type: (this.refs as any).type.value,
        detail: (this.refs as any).detail.value
      };
      return this.props.report(this.props.reportUrl, data).then(() => {
        this.setState({ submitted: true, error: null });
      }).catch(err => {
        this.setState({ error: "There was an error posting this problem" });
      });
    } else {
      this.setState({ error: "You must select a type" });
    }
  }

  typeSelected() {
    return !!(this.refs as any).type.value;
  }
}