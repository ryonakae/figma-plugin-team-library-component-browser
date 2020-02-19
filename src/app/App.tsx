import * as React from 'react'
import '@/app/assets/css/style.css'
import Tab from '@/app/components/Tab'

export default class App extends React.Component {
  render(): JSX.Element {
    return (
      <div>
        <Tab />
      </div>
    )
  }
}
