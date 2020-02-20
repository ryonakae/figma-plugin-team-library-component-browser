import * as React from 'react'
import { inject, observer } from 'mobx-react'
import ListItem from '~/app/components/ListItem'
import Store from '@/app/Store'

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

  getLibrary(): Promise<void> {
    return new Promise(resolve => {
      parent.postMessage(
        {
          pluginMessage: {
            type: 'get'
          }
        } as Message,
        '*'
      )

      onmessage = (msg): void => {
        const messageType: MessageType = msg.data.pluginMessage.type

        if (messageType === 'getsuccess') {
          resolve()
        }
      }
    })
  }

  async componentDidMount(): Promise<void> {
    console.log('List did mount')
    this.setState({ isLoading: true })
    await this.getLibrary()
    this.setState({ isLoading: false })
    // console.log(this.props.store!.library[0].name)
  }

  componentWillUnmount(): void {
    console.log('List will unmount')
  }

  render(): JSX.Element {
    const library = this.props.store!.library as Array<FigmaDocument>
    console.log(library)

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
