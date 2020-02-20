import * as React from 'react'
import Modal from 'react-modal'
import { inject, observer } from 'mobx-react'
import Store from '../Store'

type Props = {
  store?: Store
}
type State = {}

@inject('store')
@observer
export default class Dialog extends React.Component<Props, State> {
  constructor(props) {
    super(props)
  }

  close(): void {
    // this.props.store!.isDialogOpen = false
    this.props.store!.closeDialog()
  }

  onConfirm(): void {
    if (this.props.store!.onDialogConfirm) {
      this.props.store!.onDialogConfirm()
    }
    this.close()
  }

  render(): JSX.Element {
    const { isDialogOpen, onDialogConfirm } = this.props.store!

    return (
      <Modal
        isOpen={isDialogOpen}
        contentLabel="Example Modal"
        // className="modal"
        // overlayClassName="overlay"
      >
        <h2>ModalWindow</h2>
        <div onClick={this.close.bind(this)}>Close</div>
        {onDialogConfirm && (
          <div onClick={this.onConfirm.bind(this)}>Confirm</div>
        )}
      </Modal>
    )
  }
}
