import * as React from 'react'
import { inject, observer } from 'mobx-react'
import Store from '@/app/Store'
import Util from '@/app/Util'
import ListDocument from '@/app/components/ListDocument'
import Options from '@/app/components/Options'

type Props = {
  store?: Store
}
type State = {
  isLoading: boolean
}

@inject('store')
@observer
export default class List extends React.Component<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      isLoading: false
    }
  }

  async getLibrary(): Promise<void> {
    parent.postMessage(
      {
        pluginMessage: {
          type: 'get'
        }
      } as Message,
      '*'
    )

    await Util.wait(500)
  }

  async fetch(): Promise<void> {
    this.setState({ isLoading: true })
    await this.getLibrary()
    this.setState({ isLoading: false })
  }

  componentDidMount(): void {
    console.log('List did mount')
    this.fetch()
  }

  componentWillUnmount(): void {
    console.log('List will unmount')
  }

  render(): JSX.Element {
    // const library = this.props.store!.library as Array<FigmaDocument>
    const isLoading = this.state.isLoading

    return (
      <div>
        <div onClick={this.fetch.bind(this)}>Refresh</div>

        {isLoading && <div>Loading</div>}

        {!isLoading &&
          (this.props.store!.library as Array<
            FigmaDocument
          >).map((document, index) => (
            <ListDocument
              key={index}
              name={document.name}
              id={document.id}
              pages={document.pages}
            />
          ))}

        {!isLoading && this.props.store!.library.length === 0 && (
          <div>No component</div>
        )}

        <Options />
      </div>
    )
  }
}
