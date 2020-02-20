import * as React from 'react'

type Props = FigmaComponent
type State = {}

export default class ListComponent extends React.Component<Props, State> {
  constructor(props) {
    super(props)
  }

  render(): JSX.Element {
    return (
      <div>
        {this.props.componentKey && (
          <div>
            <div>{this.props.name}</div>
            <div>id: {this.props.id}</div>
            <div>key: {this.props.componentKey}</div>
          </div>
        )}
      </div>
    )
  }
}
