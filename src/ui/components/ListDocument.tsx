import * as React from 'react'
import ListPage from '@/ui/components/ListPage'
import { inject, observer } from 'mobx-react'
import Store from '@/ui/Store'

type Props = FigmaLibrary & {
  store?: Store
}
type State = {
  isCollapsed: boolean
}

@inject('store')
@observer
export default class ListDocument extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      isCollapsed: this.props.isCollapsed
    }
  }

  clearComponentSelection(): void {
    this.props.store!.setCurrentSelectComponent({ name: '', key: '' })
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
      <div
        className="document"
        onClick={this.clearComponentSelection.bind(this)}
      >
        <div
          className={`document-title ${isCollapsed ? 'is-collapsed' : ''}`}
          onClick={this.toggleCollapse.bind(this)}
        >
          <div className="document-title-icon">
            <img
              src={require('@/ui/assets/img/icon_arrow_down.svg').default}
              alt=""
            />
          </div>
          <div className="document-title-text">{this.props.name}</div>
        </div>
        <div className="document-pages">
          {this.props.pages.map(
            (page, index) =>
              page.components.length > 0 && (
                <ListPage
                  key={index}
                  name={page.name}
                  id={page.id}
                  components={page.components}
                  documentName={page.documentName}
                  isCollapsed={page.isCollapsed}
                />
              )
          )}
        </div>
      </div>
    )
  }
}
