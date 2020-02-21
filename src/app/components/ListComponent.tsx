import * as React from 'react'
import Util from '@/app/Util'

type Props = FigmaComponent
type State = {}

export default class ListComponent extends React.Component<Props, State> {
  private clickCount: number

  constructor(props) {
    super(props)
    this.clickCount = 0
  }

  async handleClick(): Promise<void> {
    this.clickCount++

    if (this.clickCount < 2) {
      this.onSingleClick()

      await Util.wait(250)

      if (this.clickCount > 1) {
        this.onDoubleClick()
      }
      this.clickCount = 0
    }
  }

  onSingleClick(): void {
    console.log('onSingleClick', this.props)
  }

  onDoubleClick(): void {
    console.log('onDoubleClick', this.props)
    parent.postMessage(
      {
        pluginMessage: {
          type: 'createinstance',
          data: {
            key: this.props.componentKey
          }
        }
      } as Message,
      '*'
    )
  }

  render(): JSX.Element {
    return (
      <div>
        {this.props.componentKey && (
          <div onClick={this.handleClick.bind(this)}>
            <div>{this.props.name}</div>
            <div>id: {this.props.id}</div>
            <div>key: {this.props.componentKey}</div>
          </div>
        )}
      </div>
    )
  }
}
