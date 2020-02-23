import * as React from 'react'
import { inject, observer } from 'mobx-react'
import Store from '@/app/Store'

type Props = {
  store?: Store
}
type State = {}

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

    parent.postMessage(
      {
        pluginMessage: {
          type: 'resize',
          data: {
            height: document.getElementById('app')!.clientHeight
          }
        }
      } as Message,
      '*'
    )
  }

  componentWillUnmount(): void {
    console.log('Setting will unmount')
  }

  render(): JSX.Element {
    return (
      <div className="content">
        <div className="content-title is-large">Save Team Library Data</div>
        <div className="content-note">
          <p>
            The quick brown fox jumps over the lazy dog. The quick brown fox
            jumps over the lazy dog. The quick brown fox jumps over the lazy
            dog. The quick brown fox jumps over the lazy dog. The quick brown
            fox jumps over the lazy dog.
          </p>
        </div>

        <div className="content-button">
          <div
            className="button is-active"
            onClick={this.onSaveClick.bind(this)}
          >
            Save or update this library data
          </div>
        </div>

        <div className="content-button is-zeroPadding">
          <div
            className="button is-alert-text"
            onClick={this.onClearClick.bind(this)}
          >
            Clear all library data
          </div>
        </div>
      </div>
    )
  }
}
