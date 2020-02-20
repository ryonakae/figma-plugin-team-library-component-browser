import * as React from 'react'
import { inject, observer } from 'mobx-react'
import Store from '../Store'

type Props = {
  store?: Store
}
type State = {
  isFetching: boolean
}

@inject('store')
@observer
export default class Setting extends React.Component<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      isFetching: false
    }
  }

  async onSaveClick(): Promise<void> {
    // this.setState({ isFetching: true })
    parent.postMessage(
      {
        pluginMessage: {
          type: 'save'
        }
      } as Message,
      '*'
    )
  }

  async onClearClick(): Promise<void> {
    // this.setState({ isFetching: true })

    this.props.store!.openDialog({
      dialogType: 'alert',
      dialogTitle: 'Clear All Library Data',
      dialogMessage:
        'The quick brown fox jumps over the lazy dog. The quick brown fox jumps over the lazy dog. The quick brown fox jumps over the lazy dog. ',
      dialogConfirmText: 'Clear all library data',
      dialogOnConfirm: () => {
        parent.postMessage(
          {
            pluginMessage: {
              type: 'clear'
            }
          } as Message,
          '*'
        )
      }
    })
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
        <div onClick={this.onSaveClick.bind(this)}>
          Save or update this library data
        </div>
        <div onClick={this.onClearClick.bind(this)}>Clear all library data</div>
      </div>
    )
  }
}
