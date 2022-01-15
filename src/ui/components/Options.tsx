import * as React from 'react'
import { inject, observer } from 'mobx-react'
import Store from '@/ui/Store'

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
    this.setCurrentOptions()
  }

  onOriginalSizeClick(): void {
    this.props.store!.toggleIsOriginalSize()
    this.setCurrentOptions()
  }

  setCurrentOptions(): void {
    parent.postMessage(
      {
        pluginMessage: {
          type: 'setoptions',
          data: {
            isSwap: this.props.store!.isSwap,
            isOriginalSize: this.props.store!.isOriginalSize
          }
        }
      } as Message,
      '*'
    )
  }

  componentDidMount(): void {
    parent.postMessage(
      {
        pluginMessage: {
          type: 'getoptions'
        }
      } as Message,
      '*'
    )
    console.log(this.props.store!.isSwap, this.props.store!.isOriginalSize)
  }

  render(): JSX.Element {
    const {
      isSwap,
      isOriginalSize,
      library,
      searchResults,
      searchWord
    } = this.props.store!

    let optionsClassName = ''

    // ライブラリが空→empty表示
    if (library.length === 0) {
      optionsClassName = ''
    }
    // ライブラリがあるとき
    else {
      // 検索中のとき
      if (searchWord.length > 0) {
        // searchResultsがある→検索結果を表示
        if (searchResults.length > 0) {
          optionsClassName = 'is-visible'
        }
        // searchResultsがない→empty表示
        else {
          optionsClassName = ''
        }
      }
      // 検索中ではない→ライブラリを表示
      else {
        optionsClassName = 'is-visible'
      }
    }

    return (
      <div className={`options ${optionsClassName}`}>
        <div className="options-item" onClick={this.onSwapClick.bind(this)}>
          <div>Swap</div>
          <div className={`segmentedControl is-${String(isSwap)}`}>
            <div className="segmentedControl-segment">
              <img
                src={require('@/ui/assets/img/icon_hyphen.svg').default}
                alt=""
              />
            </div>
            <div className="segmentedControl-segment">
              <img
                src={require('@/ui/assets/img/icon_check.svg').default}
                alt=""
              />
            </div>
          </div>
        </div>
        <div
          className="options-item"
          onClick={this.onOriginalSizeClick.bind(this)}
        >
          <div>Original Size when Swap</div>
          <div className={`segmentedControl is-${String(isOriginalSize)}`}>
            <div className="segmentedControl-segment">
              <img
                src={require('@/ui/assets/img/icon_hyphen.svg').default}
                alt=""
              />
            </div>
            <div className="segmentedControl-segment">
              <img
                src={require('@/ui/assets/img/icon_check.svg').default}
                alt=""
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
}
