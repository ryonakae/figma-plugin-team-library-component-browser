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
