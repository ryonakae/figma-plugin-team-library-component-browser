import * as React from 'react'
import ListComponent from '@/app/components/ListComponent'
import { inject, observer } from 'mobx-react'
import Store from '@/app/Store'

type Props = FigmaPage & {
  store?: Store
}
type State = {
  isCollapsed: boolean
}

@inject('store')
@observer
export default class ListPage extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      isCollapsed: this.props.isCollapsed
    }
  }

  toggleCollapse(): void {
    this.setState({ isCollapsed: !this.state.isCollapsed })
  }

  componentDidUpdate(): void {
    this.props.store!.resizeUI()
  }

  render(): JSX.Element {
    const { isCollapsed } = this.state

    return (
      <div className="page">
        <div
          className={`page-title ${isCollapsed ? 'is-collapsed' : ''}`}
          onClick={this.toggleCollapse.bind(this)}
        >
          <div className="page-title-icon">
            <img
              src={require('@/app/assets/img/icon_arrow_down.svg').default}
              alt=""
            />
          </div>
          <div className="page-title-text">{this.props.name}</div>
        </div>
        <div className="page-components">
          {this.props.components.map((component, index) => (
            <ListComponent
              key={index}
              name={component.name}
              id={component.id}
              componentKey={component.componentKey}
              documentName={component.documentName}
              pageName={component.pageName}
              combinedName={component.combinedName}
            />
          ))}
        </div>
      </div>
    )
  }
}
