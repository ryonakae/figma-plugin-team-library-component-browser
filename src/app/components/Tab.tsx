import * as React from 'react'

type MyProps = {}
type MyState = {
  tabID: 'components' | 'setting'
}

export default class Tab extends React.Component<MyProps, MyState> {
  constructor(props) {
    super(props)
    this.state = {
      tabID: 'components'
    }
  }

  handleClick(tabID: MyState['tabID']): void {
    this.setState({
      tabID
    })
  }

  render(): JSX.Element {
    return (
      <nav>
        <ul>
          <li
            className={this.state.tabID === 'components' ? 'is-active' : ''}
            onClick={() => this.handleClick('components')}
          >
            Library Components
          </li>
          <li
            className={this.state.tabID === 'setting' ? 'is-active' : ''}
            onClick={() => this.handleClick('setting')}
          >
            Setting
          </li>
        </ul>
      </nav>
    )
  }
}
