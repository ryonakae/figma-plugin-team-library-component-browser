import * as React from 'react'

type MyProps = {}
type MyState = {
  isFetching: boolean
}

export default class Setting extends React.Component<MyProps, MyState> {
  constructor(props) {
    super(props)
    this.state = {
      isFetching: false
    }
  }

  async handleClick(): Promise<void> {
    this.setState({ isFetching: true })
    parent.postMessage(
      {
        pluginMessage: {
          type: 'save'
        }
      },
      '*'
    )
  }

  componentDidMount(): void {
    console.log('Setting did mount')
  }

  componentWillUnmount(): void {
    console.log('Setting will unmount')
  }

  render(): JSX.Element {
    return (
      <div>
        <div>
          <span>Save Team Library Data</span>
        </div>
        <div>
          <p>
            The quick brown fox jumps over the lazy dog. The quick brown fox
            jumps over the lazy dog. The quick brown fox jumps over the lazy
            dog. The quick brown fox jumps over the lazy dog. The quick brown
            fox jumps over the lazy dog.
          </p>
        </div>
        <div onClick={this.handleClick.bind(this)}>
          Save or update this library data
        </div>
      </div>
    )
  }
}
