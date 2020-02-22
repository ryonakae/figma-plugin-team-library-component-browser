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
      <div>
        <div>{this.props.name}</div>
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
    )
  }
}
