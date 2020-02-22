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
      <div>
        <div onClick={this.onSwapClick.bind(this)}>Swap: {String(isSwap)}</div>
        <div onClick={this.onOriginalSizeClick.bind(this)}>
          Original Size when Swap: {String(isOriginalSize)}
        </div>
      </div>
    )
  }
}
