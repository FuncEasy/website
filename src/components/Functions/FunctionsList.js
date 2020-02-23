import React from 'react';
import { Card } from 'antd';
import http from '../../service';
import FunctionSubTable from './FunctionSubTable';
class FunctionsList extends React.Component{
  constructor() {
    super();
    this.state = {
      namespaces: []
    };
  }
  componentDidMount() {
    http.get('/namespace').then(r => {
      this.setState({namespaces: r.data});
    }).catch(e => {})
  }

  render() {
    let TitleComponent = (name) => (
      <span>
        <span style={{ paddingRight: 5 }}>NameSpace:</span>
        <span style={{ color: "green" }}>{name}</span>
      </span>
    );
    return (
      <div>
        {
          this.state.namespaces.map(data => (
            <Card
              title={<Card.Meta title={TitleComponent(data.name)} description={data.desc} />}
              key={data.id}
              style={{ marginBottom: 20 }}
            >
              <FunctionSubTable ns={data.id} />
            </Card>
          ))
        }
      </div>
    )
  }
}

export default FunctionsList;
