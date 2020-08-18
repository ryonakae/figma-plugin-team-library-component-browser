import * as React from 'react'
import Util from '@/app/Util'
import { inject, observer } from 'mobx-react'
import Store from '@/app/Store'

type Props = FigmaComponent & {
  store?: Store
}
type State = {}

@inject('store')
@observer
export default class ListComponent extends React.Component<Props, State> {
  private clickCount: number

  constructor(props) {
    super(props)
    this.clickCount = 0
  }

  async handleClick(event: React.MouseEvent<HTMLElement>): Promise<void> {
    event.persist()
    this.clickCount++

    if (this.clickCount < 2) {
      this.onSingleClick(event)

      // ダブルクリックの間隔
      await Util.wait(350)

      if (this.clickCount > 1) {
        this.onDoubleClick(event)
      }
      this.clickCount = 0
    }
  }

  onSingleClick(event: React.MouseEvent<HTMLElement>): void {
    event.stopPropagation()
    console.log('onSingleClick', this.props)
    this.props.store!.setCurrentSelectComponent({
      name: this.props.name,
      key: this.props.componentKey
    })
  }

  onDoubleClick(event: React.MouseEvent<HTMLElement>): void {
    event.stopPropagation()
    console.log('onDoubleClick', this.props)
    this.createInstance()
  }

  async createInstance(): Promise<void> {
    this.props.store!.updateIsHold(true)
    this.props.store!.openSnackbar('Now creating an instance...')

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

    // インスタンスのmasterComponentを変更する場合、なぜかエラーで処理が中断するコンポーネントがある
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

  render(): JSX.Element {
    const { name, id, componentKey, pageName } = this.props
    const {
      currentSelectComponentName,
      currentSelectComponentKey
    } = this.props.store!

    const componentClassName =
      currentSelectComponentName === name &&
      currentSelectComponentKey === componentKey
        ? 'is-selected'
        : ''

    return (
      <div>
        <div
          onClick={this.handleClick.bind(this)}
          className={`component ${componentClassName}`}
        >
          <div className="component-icon">
            <img
              src={require('@/app/assets/img/icon_component.svg').default}
              alt=""
            />
          </div>
          <div className="component-title">
            <span>
              {pageName} / {name}
            </span>
          </div>
          <div
            className="component-button button is-border is-small"
            onClick={this.onDoubleClick.bind(this)}
          >
            <img
              src={require('@/app/assets/img/icon_instance.svg').default}
              alt=""
              className="button-icon"
            />
            Create
          </div>
        </div>
      </div>
    )
  }
}
