import React from "react";
import http from '../../service';
import {Col, Row, Select, Radio} from "antd";
import { ChartCard, Bar } from "ant-design-pro/lib/Charts"
const Option = Select.Option;
class FunctionReport extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      index: 0,
      type: 'days',
      daysInvokeSuccessReport: [],
      daysInvokeFailedReport: [],
      daysSpeedReport: [],
      weeksInvokeSuccessReport: [],
      weeksInvokeFailedReport: [],
      weeksSpeedReport: [],
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
      let daysInvokeSuccessReport = daysInvokeReportData.map(item => ({
        x: item.date,
        y: item.successCount,
      }));
      let daysInvokeFailedReport = daysInvokeReportData.map(item => ({
        x: item.date,
        y: item.failCount,
      }));
      let daysSpeedReport = daysSpeedReportDate.map(item => ({
        x: item.date,
        y: item.averageSpeed,
      }));
      let weeksInvokeSuccessReport = weeksInvokeReportData.map(item => ({
        x: item.week,
        y: item.sumSuccess,
      }));
      let weeksInvokeFailedReport = weeksInvokeReportData.map(item => ({
        x: item.week,
        y: item.sumFail,
      }));
      let weeksSpeedReport = weeksSpeedReportData.map(item => ({
        x: item.week,
        y: item.averageSpeed,
      }));
      this.setState({
        index,
        daysInvokeSuccessReport,
        daysInvokeFailedReport,
        daysSpeedReport,
        weeksInvokeSuccessReport,
        weeksInvokeFailedReport,
        weeksSpeedReport
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
          <Row gutter={16}>
            <Col span={8}>
              <Bar title="Invoke Success" height={200} data={
                this.state.type === 'days'
                  ? this.state.daysInvokeSuccessReport
                  : this.state.weeksInvokeSuccessReport
              }/>
            </Col>
            <Col span={8}>
              <Bar color="red" title="Invoke Fail" height={200} data={
                this.state.type === 'days'
                  ? this.state.daysInvokeFailedReport
                  : this.state.weeksInvokeFailedReport
              }/>
            </Col>
            <Col span={8}>
              <Bar color="green" title="Average Speed" height={200} data={
                this.state.type === 'days'
                  ? this.state.daysSpeedReport
                  : this.state.weeksSpeedReport
              }/>
            </Col>
          </Row>
        </ChartCard>
      </div>
    )
  }
}

export default FunctionReport