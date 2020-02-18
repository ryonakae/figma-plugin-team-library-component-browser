import * as React from 'react'
import '@/assets/css/style.css'

type MyProps = {};
type MyState = { title: string };

export default class App extends React.Component<MyProps, MyState> {
  constructor(props) {
    super(props)
    this.state = {
      title: 'Team Library Component Browser'
    }
  }

  render() {
    return (
      <div>
        <h1>{ this.state.title }</h1>
      </div>
    )
  }
}
