import * as React from 'react'
import ListComponent from '@/ui/components/ListComponent'
import { inject, observer } from 'mobx-react'
import Store from '@/ui/Store'
import FormatedComponentTitle from '@/ui/components/FormatedComponentTitle'

type Props = FigmaVariants & {
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
      <div className={`variants ${isCollapsed && 'is-collapsed'}`}>
        <div
          className={`variants-title`}
          onClick={this.toggleCollapse.bind(this)}
        >
          <div className="variants-title-arrow">
            <img
              src={require('@/ui/assets/img/icon_arrow_down.svg').default}
              alt=""
            />
          </div>
          <div className="variants-title-icon">
            <img
              src={require('@/ui/assets/img/icon_component.svg').default}
              alt=""
            />
          </div>
          <div className="variants-title-text">
            <FormatedComponentTitle name={this.props.name} />
          </div>
        </div>
        <div className="variants-components">
          {this.props.components.map((component, index) => (
            <ListComponent
              key={index}
              name={component.name}
              id={component.id}
              componentKey={component.componentKey}
              pageName={component.pageName}
              documentName={component.documentName}
              combinedName={component.combinedName}
              isLocalComponent={component.isLocalComponent}
              publishStatus={component.publishStatus}
              isVariantsComponent={true}
            />
          ))}
        </div>
      </div>
    )
  }
}
