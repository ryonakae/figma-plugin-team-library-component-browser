import * as React from 'react'
import ListItem from '~/app/components/ListItem'

type MyProps = {}
type MyState = {}

export default class List extends React.Component<MyProps, MyState> {
  constructor(props) {
    super(props)
  }

  list: {
    name: string
    key: string
    pageName: string
  }[] = [
    {
      name: 'component 01',
      key: 'aaaaa',
      pageName: 'pageName 01'
    },
    {
      name: 'component 02',
      key: 'bbbbb',
      pageName: 'pageName 01'
    },
    {
      name: 'component 03',
      key: 'ccccc',
      pageName: 'pageName 01'
    }
  ]

  listItems = this.list.map(item => (
    <ListItem name={item.key} key={item.key} pageName={item.pageName}>
      {item.name}
    </ListItem>
  ))

  componentDidMount(): void {
    console.log('List did mount')
  }

  componentWillUnmount(): void {
    console.log('List will unmount')
  }

  render(): JSX.Element {
    return (
      <div>
        <ul>{this.listItems}</ul>
      </div>
    )
  }
}
