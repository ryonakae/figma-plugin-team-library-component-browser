import * as React from 'react'
import { inject, observer } from 'mobx-react'
import ListItem from '~/app/components/ListItem'
import Store from '../Store'

type Props = {
  store?: Store
}
type State = {}

@inject('store')
@observer
export default class List extends React.Component<Props, State> {
  constructor(props) {
    super(props)
  }

  componentDidMount(): void {
    console.log('List did mount')

    parent.postMessage(
      {
        pluginMessage: {
          type: 'get'
        }
      } as Message,
      '*'
    )
  }

  componentWillUnmount(): void {
    console.log('List will unmount')
  }

  render(): JSX.Element {
    const library = this.props.store!.library as Array<FigmaDocument>
    return (
      <div>
        {library.map((document, index) => (
          <div className="document" key={index}>
            <div>{document.name}</div>
            {document.pages.map((page, index) => (
              <div className="page" key={index}>
                <div>{page.name}</div>
                {page.components.map((component, index) => (
                  <div className="component" key={index}>
                    <div>{component.name}</div>
                    <div>{component.id}</div>
                    <div>{component.key}</div>
                    <div>.....</div>
                  </div>
                ))}
                <div>-----</div>
              </div>
            ))}
            <div>=====</div>
          </div>
        ))}
      </div>
    )
  }
}
