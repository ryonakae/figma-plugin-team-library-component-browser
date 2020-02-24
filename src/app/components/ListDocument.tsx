import * as React from 'react'
import ListPage from '@/app/components/ListPage'
import { inject, observer } from 'mobx-react'
import Store from '@/app/Store'

type Props = FigmaDocument & {
  store?: Store
}
type State = {}

@inject('store')
@observer
export default class ListDocument extends React.Component<Props, State> {
  constructor(props) {
    super(props)
  }

  onClick(): void {
    if (this.props.store!.currentSelectComponentKey.length > 0) {
      this.props.store!.setCurrentSelectComponentKey('')
    }
  }

  render(): JSX.Element {
    return (
      <div className="document" onClick={this.onClick.bind(this)}>
        <div className="document-title">
          <div className="document-title-icon">
            <span>.</span>
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
                  parentName={page.parentName}
                  isCollapsed={page.isCollapsed}
                />
              )
          )}
        </div>
      </div>
    )
  }
}
