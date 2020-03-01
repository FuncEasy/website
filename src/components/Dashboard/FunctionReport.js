import React from "react";
import http from '../../service';
import {Col, Row, Select, Radio, Empty} from "antd";
import {ChartCard, Pie} from "ant-design-pro/lib/Charts"
import {
  Chart,
  Geom,
  Axis,
  Tooltip,
  Legend,
} from "bizcharts";
const Option = Select.Option;
class FunctionReport extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      index: 0,
      type: 'days',
      daysInvokeReport: [],
      daysInvokeSumReport: [],
      daysSpeedReport: [],
      weeksSpeedReport: [],
      weeksInvokeReport: [],
      weeksInvokeSumReport: [],
    }
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (nextProps.functions.length > 0) {
      this.getReport(0, nextProps.functions)
    }
  }

  getReport(index, obj) {
    http.get(`/function/report/${obj[index].id}`).then(r => {
      let daysInvokeReportData = r.data.daysReport.daysInvokeReports;
      let daysSpeedReportDate = r.data.daysReport.daysSpeedReports;
      let weeksInvokeReportData = r.data.weeksReport.weeksInvokeReports;
      let weeksSpeedReportData = r.data.weeksReport.weeksSpeedReports;

      let daysInvokeReport = [];
      let daysInvokeSumReport = [];
      daysInvokeReportData.forEach(item => {
        daysInvokeReport.push({
          range: item.date,
          type: 'success',
          value: item.successCount,
        });
        daysInvokeReport.push({
          range: item.date,
          type: 'fail',
          value: item.failCount,
        });
        daysInvokeSumReport.push({
          range: item.date,
          counts: item.successCount + item.failCount
        })
      });
      let daysSpeedReport = daysSpeedReportDate.map(item => ({
        range: item.date,
        speed: item.averageSpeed === 0 ? 0 : item.averageSpeed.toFixed(1),
      }));

      let weeksInvokeReport = [];
      let weeksInvokeSumReport = [];
      weeksInvokeReportData.forEach(item => {
        weeksInvokeReport.push({
          range: item.week,
          type: 'success',
          value: item.sumSuccess,
        });
        weeksInvokeReport.push({
          range: item.week,
          type: 'fail',
          value: item.sumFail,
        });
        weeksInvokeSumReport.push({
          range: item.week,
          counts: item.sumSuccess + item.sumFail
        })
      });
      let weeksSpeedReport = weeksSpeedReportData.map(item => ({
        range: item.week,
        speed: item.averageSpeed === 0 ? 0 : item.averageSpeed.toFixed(1),
      }));
      this.setState({
        index,
        daysInvokeReport,
        daysInvokeSumReport,
        daysSpeedReport,
        weeksSpeedReport,
        weeksInvokeReport,
        weeksInvokeSumReport,
      })
    })
  }

  onChange(index) {
    this.getReport(index, this.props.functions)
  }

  render() {
    let currentName = this.props.functions.length > 0
      ? this.props.functions[this.state.index].name
      : '';
    let InvokeColorMap = {
      "success": "rgb(47, 194, 91)",
      "fail": "rgb(240, 72, 100)"
    };
    return (
      <div>
        <ChartCard
          title="Function Report"
          total={currentName}
          action={
            <div>
              <Radio.Group
                onChange={e => this.setState({type: e.target.value})}
                defaultValue="days"
                style={{ paddingRight: 5 }}
              >
                <Radio.Button value="days">Days</Radio.Button>
                <Radio.Button value="weeks">Weeks</Radio.Button>
              </Radio.Group>
              <Select
                value={this.state.index}
                onChange={index => this.onChange(index)}
                style={{ width: 200 }}
              >
                {
                  this.props.functions.map((item, index) => (
                    <Option value={index}>{item.name}</Option>
                  ))
                }
              </Select>
            </div>
          }
        >
          {
            this.props.functions.length > 0
              ? <Row gutter={16}>
                <Col span={8}>
                  <h3>Invoke Status</h3>
                  <Chart
                    data={
                      this.state.type === 'days'
                        ? this.state.daysInvokeReport
                        :this.state.weeksInvokeReport
                    }
                    height={300}
                    forceFit
                  >
                    <Axis name="range" />
                    <Axis name="value" position="left"/>
                    <Tooltip />
                    <Legend />
                    <Geom
                      type="intervalStack"
                      position="range*value"
                      shape="smooth"
                      color={['type', t => InvokeColorMap[t]]}
                      opacity={0.8}
                    />
                  </Chart>
                </Col>
                <Col span={8}>
                  <h3>Invoke Counts</h3>
                  <Chart
                    data={
                      this.state.type === 'days'
                        ? this.state.daysInvokeSumReport
                        : this.state.weeksInvokeSumReport
                    }
                    height={300}
                    forceFit
                  >
                    <Axis name="range" />
                    <Axis name="counts" position="left"/>
                    <Tooltip />
                    <Legend />
                    <Geom type="area" position="range*counts" color="rgb(24, 144, 255)" shape="smooth" />
                    <Geom
                      type="line"
                      position="range*counts"
                      color="rgb(24, 144, 255)"
                      shape="smooth"
                      size={2}
                    />
                  </Chart>
                </Col>
                <Col span={8}>
                  <h3>Speed</h3>
                  <Chart
                    data={
                      this.state.type === 'days'
                        ? this.state.daysSpeedReport
                        : this.state.weeksSpeedReport
                    }
                    height={300}
                    forceFit
                  >
                    <Axis name="range" />
                    <Axis
                      name="speed"
                      position="left"
                      label={{formatter: val => `${val}ms`}}
                    />
                    <Tooltip />
                    <Legend />
                    <Geom type="line" position="range*speed" color="#ff8a65" size={2} shape="smooth" />
                    <Geom
                      type="point"
                      color="#ff8a65"
                      position="range*speed"
                      shape="smooth"
                      style={{
                        fill: "#ff8a65",
                        stroke: "#fff",
                        lineWidth: 1
                      }}
                    />
                  </Chart>
                </Col>
              </Row>
              : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          }
        </ChartCard>
      </div>
    )
  }
}

export default FunctionReport