import * as React from 'react'
import { inject, observer } from 'mobx-react'
import Store from '@/ui/Store'
import Util from '@/ui/Util'

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
    this.props.store!.updateIsHold(true)
    this.props.store!.notify('Now save or update this library data...')
    await Util.wait(this.props.store!.transitionDurationMS)
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
        'If you want to list team library components again, you need to press the "Save or update this library data" button again.',
      dialogConfirmText: 'Clear all library data',
      dialogOnConfirm: async () => {
        this.props.store!.updateIsHold(true)
        this.props.store!.notify('Now clear all library data...')
        await Util.wait(this.props.store!.transitionDurationMS)
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
            Because of the specifications of Figma's API, we can't get team
            library data automatically.
          </p>
          <p>
            So this plugin uses the figma.clientStorage API to store the library
            data on your machine.
          </p>
          <p>
            To store library data in clientStorage, you need to run this plugin
            in your library.
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
