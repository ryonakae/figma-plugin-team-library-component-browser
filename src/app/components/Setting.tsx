import * as React from 'react'

type MyProps = {}
type MyState = {}

export default class Setting extends React.Component<MyProps, MyState> {
  constructor(props) {
    super(props)
  }

  componentDidMount(): void {
    console.log('Setting did mount')
  }

  componentWillUnmount(): void {
    console.log('Setting will unmount')
  }

  render(): JSX.Element {
    return <div>Setting</div>
  }
}
