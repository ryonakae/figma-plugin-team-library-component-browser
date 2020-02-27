import * as React from 'react'
import { inject, observer } from 'mobx-react'
import List from '@/app/components/List'
import Setting from '@/app/components/Setting'
import Store from '@/app/Store'

type Props = {
  store?: Store
}
type State = {}

@inject('store')
@observer
export default class Content extends React.Component<Props, State> {
  constructor(props) {
    super(props)
  }

  render(): JSX.Element {
    const { isHold } = this.props.store!

    return (
      <div className={`main ${isHold ? 'is-hold' : ''}`}>
        {this.props.store!.tabID === 'list' && <List />}
        {this.props.store!.tabID === 'setting' && <Setting />}
      </div>
    )
  }
}
