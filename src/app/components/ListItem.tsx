import * as React from 'react'

type Props = {
  name: string
  key: string
  pageName: string
}
type State = {}

export default class ListItem extends React.Component<Props, State> {
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
