import React from "react"
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
export class CodePreview extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { code, language } = this.props;
    return (
      <SyntaxHighlighter language={language} style={docco} showLineNumbers={true}>
        {code}
      </SyntaxHighlighter>
    )
  }
}
export default CodePreview