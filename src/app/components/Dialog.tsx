import * as React from 'react'
import Modal from 'react-modal'
import { inject, observer } from 'mobx-react'
import Store from '@/app/Store'

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
    if (this.props.store!.dialogOnConfirm) {
      this.props.store!.dialogOnConfirm()
    }
    this.close()
  }

  render(): JSX.Element {
    const {
      isDialogOpen,
      dialogType,
      dialogTitle,
      dialogMessage,
      dialogConfirmText,
      dialogOnConfirm
    } = this.props.store!

    return (
      <Modal isOpen={isDialogOpen} className={`is-${dialogType}`}>
        <div>
          <div>{dialogTitle}</div>
          <div onClick={this.close.bind(this)}>Close</div>
        </div>

        {dialogMessage && <div>{dialogMessage}</div>}

        {dialogConfirmText && (
          <div onClick={this.onConfirm.bind(this)}>{dialogConfirmText}</div>
        )}
      </Modal>
    )
  }
}
