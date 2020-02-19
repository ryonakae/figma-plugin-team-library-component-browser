import * as React from 'react'

type MyProps = {
  name: string
  key: string
  pageName: string
}
type MyState = {}

export default class ListItem extends React.Component<MyProps, MyState> {
  constructor(props) {
    super(props)
  }

  render(): JSX.Element {
    return (
      <div>
        <div className="icon"></div>
        <div className="name">{this.props.name}</div>
      </div>
    )
  }
}
