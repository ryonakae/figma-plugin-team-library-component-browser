import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { StoreType } from '@/app/store'

type MyProps = {
  store?: StoreType
}
type MyState = {
  tabID: 'list' | 'setting'
}

@inject('store')
@observer
export default class Tab extends React.Component<MyProps, MyState> {
  constructor(props) {
    super(props)
  }

  handleClick(tabID: StoreType['tabID']): void {
    this.props.store!.updateTabID(tabID)
  }

  render(): JSX.Element {
    return (
      <nav>
        <ul>
          <li
            className={this.props.store!.tabID === 'list' ? 'is-active' : ''}
            onClick={() => this.handleClick('list')}
          >
            Library Components
          </li>
          <li
            className={this.props.store!.tabID === 'setting' ? 'is-active' : ''}
            onClick={() => this.handleClick('setting')}
          >
            Setting
          </li>
        </ul>
      </nav>
    )
  }
}
