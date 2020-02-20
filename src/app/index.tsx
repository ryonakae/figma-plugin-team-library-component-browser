import * as React from 'react'
import * as ReactDOM from 'react-dom'
import App from '@/app/components/App'
import Modal from 'react-modal'
import { mobxDidRunLazyInitializersSymbol } from 'mobx/lib/internal'

const app = document.getElementById('app') as HTMLElement

Modal.setAppElement(app)

ReactDOM.render(<App />, app)
