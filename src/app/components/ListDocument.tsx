import * as React from 'react'
import ListPage from '@/app/components/ListPage'

type Props = FigmaDocument
type State = {}

export default class ListDocument extends React.Component<Props, State> {
  constructor(props) {
    super(props)
  }

  render(): JSX.Element {
    return (
      <div className="document">
        <div className="document-title">
          <div className="document-title-icon">
            <span>.</span>
          </div>
          <div className="document-title-text">{this.props.name}</div>
        </div>
        {this.props.pages.map(
          (page, index) =>
            page.components.length > 0 && (
              <ListPage
                key={index}
                name={page.name}
                id={page.id}
                components={page.components}
                parentName={page.parentName}
              />
            )
        )}
      </div>
    )
  }
}
