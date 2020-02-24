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

    let confirmClassName = 'is-active'
    if (dialogType === 'alert') {
      confirmClassName = 'is-alert'
    }

    return (
      <Modal
        isOpen={isDialogOpen}
        className={`dialog is-${dialogType}`}
        overlayClassName="dialog-overlay"
        shouldCloseOnOverlayClick={true}
        onRequestClose={this.close.bind(this)}
      >
        <div className="dialog-header">
          <div className="dialog-title">{dialogTitle}</div>
          <div className="dialog-close" onClick={this.close.bind(this)}>
            <img
              src={require('@/app/assets/img/icon_close.svg').default}
              alt=""
            />
          </div>
        </div>

        {dialogMessage && <div className="dialog-message">{dialogMessage}</div>}

        {dialogConfirmText && (
          <div className="dialog-button">
            <div
              className={`button ${confirmClassName}`}
              onClick={this.onConfirm.bind(this)}
            >
              {dialogConfirmText}
            </div>
          </div>
        )}
      </Modal>
    )
  }
}
