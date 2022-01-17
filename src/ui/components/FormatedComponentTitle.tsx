import * as React from 'react'

export default class FormatedComponentTitle extends React.Component<{
  name: string
}> {
  constructor(props) {
    super(props)
  }

  render(): JSX.Element {
    return (
      <>
        {this.props.name.split('/').map((n, index, array) => (
          <React.Fragment key={index}>
            <span className="component-title-text">{n}</span>
            {index + 1 !== array.length && (
              <span className="component-title-slash">/</span>
            )}
          </React.Fragment>
        ))}
      </>
    )
  }
}
