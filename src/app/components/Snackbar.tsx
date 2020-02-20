import * as React from 'react'
import { inject, observer } from 'mobx-react'
import Store from '@/app/Store'
import { Snackbar as ReactSnackbar } from '@material/react-snackbar'

import '@material/react-snackbar/dist/snackbar.css'

type Props = {
  store?: Store
}
type State = {}

@inject('store')
@observer
export default class Snackbar extends React.Component<Props, State> {
  constructor(props) {
    super(props)
  }

  close(): void {
    this.props.store!.closeSnackbar()
  }

  render(): JSX.Element {
    const { isSnackbarOpen, snackbarMessage } = this.props.store!

    return (
      <ReactSnackbar
        open={isSnackbarOpen}
        message={snackbarMessage}
        timeoutMs={4000}
        onClose={this.close.bind(this)}
      />
    )
  }
}
