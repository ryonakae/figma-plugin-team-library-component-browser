import * as React from 'react'
import * as ReactDOM from 'react-dom'
import App from '@/app/components/App'
import Modal from 'react-modal'

const app = document.getElementById('app') as HTMLElement

Modal.setAppElement(app)
Modal.defaultStyles.content = undefined
Modal.defaultStyles.overlay = undefined

ReactDOM.render(<App />, app)
