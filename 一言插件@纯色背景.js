// iOS14一言接口插件

const testMode = true
const widgetPreview = "medium"

class Hitokoto {
  /**
   * 渲染组件
   */
  async render() {
    let widget = new ListWidget()
    let data = await this.getData()
    // 主体内容文字
    let content = widget.addText(data['hitokoto'])
    content.font = Font.lightSystemFont(14)
    widget.addSpacer(10)
    let footer = widget.addText("—— " + data['from'])
    footer.font = Font.lightSystemFont(10)
    footer.textOpacity = 0.5
    footer.rightAlignText()
    return widget
  }

  async getData() {
    let api = `https://v1.hitokoto.cn/`
    let data = null
    const cacheKey = `${this.fileName}_cache`
    try {
      let req = new Request(api)
      data = await req.loadJSON()
    } catch (e) { }
    // 判断数据是否为空（加载失败）
    if (!data) {
      // 判断是否有缓存
      if (Keychain.contains(cacheKey)) {
        let cache = Keychain.get(cacheKey)
        return JSON.parse(cache)
      } else {
        // 刷新
        return null
      }
    }
    // 存储缓存
    Keychain.set(cacheKey, JSON.stringify(data))
    return data
  }

  async init() {
    let widgetRender = await this.render()
    Script.setWidget(widgetRender)
    if (testMode) {
      let widgetSizeFormat = widgetPreview.toLowerCase()
      if (widgetSizeFormat === "small") widgetRender.presentSmall()
      if (widgetSizeFormat === "medium") widgetRender.presentMedium()
      if (widgetSizeFormat === "large") widgetRender.presentLarge()
    }
    Script.complete()
  }
}

await new Hitokoto().init()
