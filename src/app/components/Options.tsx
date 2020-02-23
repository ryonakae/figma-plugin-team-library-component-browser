import * as React from 'react'
import { inject, observer } from 'mobx-react'
import Store from '@/app/Store'

type Props = {
  store?: Store
}
type State = {}

@inject('store')
@observer
export default class Options extends React.Component<Props, State> {
  constructor(props) {
    super(props)
  }

  onSwapClick(): void {
    this.props.store!.toggleIsSwap()
  }

  onOriginalSizeClick(): void {
    this.props.store!.toggleIsOriginalSize()
  }

  render(): JSX.Element {
    const { isSwap, isOriginalSize } = this.props.store!

    return (
      <div className="options">
        <div className="options-item" onClick={this.onSwapClick.bind(this)}>
          <div>Swap</div>
          <div className="segmentedControl">
            <div
              className={`segmentedControl-segment ${
                !isSwap ? 'is-active' : ''
              }`}
            >
              <span>off</span>
            </div>
            <div
              className={`segmentedControl-segment ${
                isSwap ? 'is-active' : ''
              }`}
            >
              <span>on</span>
            </div>
          </div>
        </div>
        <div
          className="options-item"
          onClick={this.onOriginalSizeClick.bind(this)}
        >
          <div>Original Size when Swap</div>
          <div className="segmentedControl">
            <div
              className={`segmentedControl-segment ${
                !isOriginalSize ? 'is-active' : ''
              }`}
            >
              <span>off</span>
            </div>
            <div
              className={`segmentedControl-segment ${
                isOriginalSize ? 'is-active' : ''
              }`}
            >
              <span>on</span>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
