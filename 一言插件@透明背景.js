// iOS14一言接口插件

// testMode设置为true可以预览插件效果
const testMode = true

// widgetPreview指定窗口小部件预览的大小："small", "medium", "large" 三个值
const widgetPreview = "medium"

// resetWidget更改为true以重置小部件背景
const resetWidget = false

const filename = Script.name() + ".jpg"
const files = FileManager.local()
const path = files.joinPath(files.documentsDirectory(), filename)
const fileExists = files.fileExists(path)

let widget = new ListWidget()

if (config.runsInWidget || (testMode && fileExists && !resetWidget)) {
  widget.backgroundImage = files.readImage(path)

  let data = await getData(`https://v1.hitokoto.cn/`)
  let content = widget.addText(data['hitokoto'])
  content.font = Font.lightSystemFont(14)
  widget.addSpacer(10)
  let footer = widget.addText("—— " + data['from'])
  footer.font = Font.lightSystemFont(10)
  footer.textOpacity = 0.5
  footer.rightAlignText()

  Script.setWidget(widget)
  if (testMode) {
    let widgetSizeFormat = widgetPreview.toLowerCase()
    if (widgetSizeFormat == "small") { widget.presentSmall() }
    if (widgetSizeFormat == "medium") { widget.presentMedium() }
    if (widgetSizeFormat == "large") { widget.presentLarge() }
  }
  Script.complete()
} else {
  let message = "在开始之前，先去主屏幕进入图标排列模式，滑到最右边的空白页，并进行截图。"
  let exitOptions = ["已经截图，继续", "退出去截图"]
  let shouldExit = await generateAlert(message, exitOptions)
  if (shouldExit) return

  let img = await Photos.fromLibrary()
  let height = img.size.height
  let phone = phoneSizes()[height]
  if (!phone) {
    message = "看起来你选择的图片不是iPhone的截图，或者你的iPhone不支持。请换一张图片再试一次。"
    await generateAlert(message, ["好"])
    return
  }

  message = "你想创建什么尺寸的小组件？"
  let sizes = ["小尺寸", "中尺寸", "大尺寸"]
  let size = await generateAlert(message, sizes)
  let widgetSize = sizes[size]

  message = "你想把widget放在哪里？"
  message += (height == 1136 ? " (请注意，您的设备只支持两行小部件，所以中间和底部的选项是一样的。)" : "")

  let crop = { w: "", h: "", x: "", y: "" }
  if (widgetSize === "小尺寸") {
    crop.w = phone['小']
    crop.h = phone['小']
    let positions = ["左边顶部", "右边顶部", "左边中间", "右边中间", "左边底部", "右边底部"]
    let position = await generateAlert(message, positions)
    let keys = positions[position].toLowerCase().split('边')
    crop.x = phone[keys[0]]
    crop.y = phone[keys[1]]

  } else if (widgetSize === "中尺寸") {
    crop.w = phone['中']
    crop.h = phone['小']
    crop.x = phone['左']
    let positions = ["顶部", "中间", "底部"]
    let position = await generateAlert(message, positions)
    let key = positions[position].toLowerCase()
    crop.y = phone[key]

  } else if (widgetSize === "大尺寸") {
    crop.w = phone['中']
    crop.h = phone['大']
    crop.x = phone['左']
    let positions = ["顶部", "底部"]
    let position = await generateAlert(message, positions)
    crop.y = position ? phone['中间'] : phone['顶部']
  }

  let imgCrop = cropImage(img, new Rect(crop.x, crop.y, crop.w, crop.h))

  message = "widget的背景图已裁切完成，想在Scriptable内部使用还是导出到相册？"
  const exportPhotoOptions = ["在Scriptable内部使用", "导出到相册"]
  const exportPhoto = await generateAlert(message, exportPhotoOptions)

  if (exportPhoto) {
    Photos.save(imgCrop)
  } else {
    files.writeImage(path, imgCrop)
  }

  Script.complete()
}

async function generateAlert(message, options) {
  let alert = new Alert()
  alert.message = message
  for (const option of options) {
    alert.addAction(option)
  }
  let response = await alert.presentAlert()
  return response
}

function cropImage(img, rect) {
  let draw = new DrawContext()
  draw.size = new Size(rect.width, rect.height)
  draw.drawImageAtPoint(img, new Point(-rect.x, -rect.y))
  return draw.getImage()
}

async function getData(api) {
  let data = null
  const cacheKey = `${this.fileName}_cache`
  try {
    let req = new Request(api)
    data = await req.loadJSON()
  } catch (e) { }
  if (!data) {
    if (Keychain.contains(cacheKey)) {
      let cache = Keychain.get(cacheKey)
      return JSON.parse(cache)
    } else {
      return null
    }
  }
  Keychain.set(cacheKey, JSON.stringify(data))
  return data
}

function phoneSizes() {
  let phones = {
    // 12 Pro Max
    "2778": { '小': 510, '中': 1092, '大': 1146, '左': 96, '右': 678, '顶部': 246, '中间': 882, '底部': 1518 },
    // 12 and 12 Pro
    "2532": { '小': 474, '中': 1014, '大': 1062, '左': 78, '右': 618, '顶部': 231, '中间': 819, '底部': 1407 },
    "2688": { '小': 507, '中': 1080, '大': 1137, '左': 81, '右': 654, '顶部': 228, '中间': 858, '底部': 1488 },
    "1792": { '小': 338, '中': 720, '大': 758, '左': 54, '右': 436, '顶部': 160, '中间': 580, '底部': 1000 },
    "2436": { '小': 465, '中': 987, '大': 1035, '左': 69, '右': 591, '顶部': 213, '中间': 783, '底部': 1353 },
    "2208": { '小': 471, '中': 1044, '大': 1071, '左': 99, '右': 672, '顶部': 114, '中间': 696, '底部': 1278 },
    "1334": { '小': 296, '中': 642, '大': 648, '左': 54, '右': 400, '顶部': 60, '中间': 412, '底部': 764 },
    "1136": { '小': 282, '中': 584, '大': 622, '左': 30, '右': 332, '顶部': 59, '中间': 399, '底部': 399 },
    "1624": { '小': 310, '中': 658, '大': 690, '左': 46, '右': 394, '顶部': 142, '中间': 522, '底部': 902 },
    "2001": { '小': 444, '中': 963, '大': 972, '左': 81, '右': 600, '顶部': 90, '中间': 618, '底部': 1146 }
  }
  return phones
}
