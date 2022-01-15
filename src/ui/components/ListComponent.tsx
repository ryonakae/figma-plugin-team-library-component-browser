import * as React from 'react'
import Util from '@/ui/Util'
import { inject, observer } from 'mobx-react'
import Store from '@/ui/Store'

type Props = FigmaComponent & {
  store?: Store
}
type State = {}

@inject('store')
@observer
export default class ListComponent extends React.PureComponent<Props, State> {
  private isSelected: boolean

  constructor(props) {
    super(props)
    this.isSelected = false
  }

  onListComponentClick(event: React.MouseEvent<HTMLElement>): void {
    event.stopPropagation()
    console.log('onListComponentClick', this.props)
    this.props.store!.setCurrentSelectComponent({
      name: this.props.name,
      key: this.props.componentKey
    })
  }

  onCreateClick(event: React.MouseEvent<HTMLElement>): void {
    event.stopPropagation()
    console.log('onCreateClick', this.props)
    this.createInstance()
  }

  onGoToMainClick(event: React.MouseEvent<HTMLElement>): void {
    event.stopPropagation()
    console.log('onCreateClick', this.props)
    this.goToMainComponent()
  }

  async createInstance(): Promise<void> {
    this.props.store!.updateIsHold(true)
    this.props.store!.notify('Now creating an instance...')

    await Util.wait(this.props.store!.transitionDurationMS)

    parent.postMessage(
      {
        pluginMessage: {
          type: 'createinstance',
          data: {
            key: this.props.componentKey,
            name: this.props.name,
            id: this.props.id,
            options: {
              isSwap: this.props.store!.isSwap,
              isOriginalSize: this.props.store!.isOriginalSize
            }
          }
        }
      } as Message,
      '*'
    )

    // インスタンスのmainComponentを変更する場合、なぜかエラーで処理が中断するコンポーネントがある
    // 仕方ないので、一定時間後にisHoldがまだ有効ならエラー表示にする
    const TIMEOUT_DURATION_MS = 10000
    setTimeout(() => {
      if (this.props.store!.isHold) {
        this.props.store!.updateIsHold(false)
        this.props.store!.openDialog({
          dialogType: 'alert',
          dialogTitle: 'An Error Occurred',
          dialogMessage: 'Error creating or swapping instance.'
        })
        this.props.store!.setCurrentSelectComponent({ name: '', key: '' })
      }
    }, TIMEOUT_DURATION_MS)
  }

  async goToMainComponent(): Promise<void> {
    this.props.store!.updateIsHold(true)
    this.props.store!.notify('Now go to main component...')

    await Util.wait(this.props.store!.transitionDurationMS)

    parent.postMessage(
      {
        pluginMessage: {
          type: 'gotomaincomponent',
          data: {
            key: this.props.componentKey,
            name: this.props.name,
            id: this.props.id,
            options: {
              isSwap: this.props.store!.isSwap,
              isOriginalSize: this.props.store!.isOriginalSize
            }
          }
        }
      } as Message,
      '*'
    )
  }

  componentDidUpdate(): void {
    this.props.store!.resizeUI()
  }

  render(): JSX.Element {
    const { name, id, componentKey, pageName } = this.props
    const {
      currentSelectComponentName,
      currentSelectComponentKey,
      isSwap
    } = this.props.store!

    this.isSelected =
      currentSelectComponentName === name &&
      currentSelectComponentKey === componentKey

    return (
      <div>
        <div
          onClick={this.onListComponentClick.bind(this)}
          className={`component ${this.isSelected ? 'is-selected' : ''}`}
        >
          <div className="component-info">
            <div className="component-icon">
              <img
                src={require('@/ui/assets/img/icon_component.svg').default}
                alt=""
              />
            </div>
            <div className="component-title">
              <span>
                {/* {pageName}/{name} */}
                {name}
              </span>
            </div>
          </div>
          <div className="component-buttons">
            <div
              className="component-button button is-border is-small"
              onClick={this.onCreateClick.bind(this)}
            >
              <img
                src={require('@/ui/assets/img/icon_instance.svg').default}
                alt=""
                className="button-icon"
              />
              {isSwap ? 'Swap Selection' : 'Create Instance'}
            </div>
            {this.props.isLocalComponent && (
              <div
                className="component-button button is-border is-small"
                onClick={this.onGoToMainClick.bind(this)}
              >
                <img
                  src={
                    require('@/ui/assets/img/icon_component_black.svg').default
                  }
                  alt=""
                  className="button-icon"
                />
                Go to Main
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
}
