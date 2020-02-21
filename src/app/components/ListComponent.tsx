import * as React from 'react'
import Util from '@/app/Util'
import { inject, observer } from 'mobx-react'
import Store from '@/app/Store'

type Props = FigmaComponent & {
  store?: Store
}
type State = {}

@inject('store')
@observer
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
            key: this.props.componentKey,
            options: {
              isSwap: this.props.store!.isSwap,
              isOriginalSize: this.props.store!.isOriginalSize
            }
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
            <div>・{this.props.name}</div>
          </div>
        )}
      </div>
    )
  }
}