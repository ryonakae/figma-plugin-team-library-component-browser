import * as React from 'react'
import ListComponent from '@/app/components/ListComponent'

type Props = FigmaPage
type State = {}

export default class ListPage extends React.Component<Props, State> {
  constructor(props) {
    super(props)
  }

  render(): JSX.Element {
    return (
      <div className="page">
        <div className="page-title">
          <div className="page-title-icon">
            <span>.</span>
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
              parentName={component.parentName}
            />
          ))}
        </div>
      </div>
    )
  }
}
