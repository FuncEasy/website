import React from 'react'
import FunctionReport from "./FunctionReport";
import NameSpacePieChart from "./NameSpacePieChart";
import FunctionPieChart from "./FunctionPieChart";
import { ChartCard } from "ant-design-pro/lib/Charts";
import 'ant-design-pro/dist/ant-design-pro.css';
import http from "../../service";
import {Col, Row} from "antd";
import DataSourcePieChart from "./DataSourcePieChart";
class Index extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      namespaces: [],
      functions: [],
      dataSources: [],
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
    }).catch(e => {});
    http.get('/dataSource').then(r => {
      this.setState({dataSources: r.data})
    })
  }

  render() {
    return (
      <div>
        <div>
          <Row gutter={16} style={{ marginBottom: 20 }}>
            <Col span={8}>
              <ChartCard title="NameSpaces" total={this.state.namespaces.length} style={{ height: 300 }}>
                <NameSpacePieChart ns={this.state.namespaces}/>
              </ChartCard>
            </Col>
            <Col span={8}>
              <ChartCard title="DataSources" total={this.state.dataSources.length} style={{ height: 300 }}>
                <DataSourcePieChart ds={this.state.dataSources} />
              </ChartCard>
            </Col>
            <Col span={8}>
              <ChartCard title="Functions" total={this.state.functions.length} style={{ height: 300 }}>
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
