import React from 'react'
import FunctionReport from "./FunctionReport";
import NameSpacePieChart from "./NameSpacePieChart";
import FunctionPieChart from "./FunctionPieChart";
import { ChartCard } from "ant-design-pro/lib/Charts";
import 'ant-design-pro/dist/ant-design-pro.css';
import http from "../../service";
import {Col, Row} from "antd";
class Index extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      namespaces: [],
      functions: [],
    }
  }

  componentDidMount() {
    this.getNameSpaceAndFunctions();
  }

  getNameSpaceAndFunctions() {
    http.get('/namespace').then(r => {
      let functions = [];
      r.data.forEach(item => {
        functions.push(...item.Functions)
      });
      this.setState({namespaces: r.data, functions});
    }).catch(e => {})
  }

  render() {
    return (
      <div>
        <div>
          <Row gutter={16} style={{ marginBottom: 20 }}>
            <Col span={12}>
              <ChartCard title="NameSpaces" total={this.state.namespaces.length}>
                <NameSpacePieChart ns={this.state.namespaces}/>
              </ChartCard>
            </Col>
            <Col span={12}>
              <ChartCard title="Functions" total={this.state.functions.length}>
                <FunctionPieChart functions={this.state.functions}/>
              </ChartCard>
            </Col>
          </Row>
          <div>
            <FunctionReport functions={this.state.functions} />
          </div>
        </div>
      </div>
    )
  }
}

export default Index;
