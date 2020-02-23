import * as React from 'react'
import { inject, observer } from 'mobx-react'
import Store from '@/app/Store'

type Props = {
  store?: Store
}
type State = {}

@inject('store')
@observer
export default class Tab extends React.Component<Props, State> {
  constructor(props) {
    super(props)
  }

  handleClick(tabID: Store['tabID']): void {
    this.props.store!.updateTabID(tabID)
  }

  render(): JSX.Element {
    return (
      <nav className="tab">
        <ul className="tab-list">
          <li
            className={`tab-item ${
              this.props.store!.tabID === 'list' ? 'is-active' : ''
            }`}
            onClick={() => this.handleClick('list')}
          >
            <span>Library Components</span>
          </li>
          <li
            className={`tab-item ${
              this.props.store!.tabID === 'setting' ? 'is-active' : ''
            }`}
            onClick={() => this.handleClick('setting')}
          >
            <span>Setting</span>
          </li>
        </ul>
      </nav>
    )
  }
}
