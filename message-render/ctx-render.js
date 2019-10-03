const moment = require('moment')
moment.locale('zh-cn')

function renderWater(waterItem) {
  const { nickname, remark, project_name, fee } = waterItem
  return `感谢聚聚 ${remark || nickname} 在 ${project_name} 中支持了 ￥${fee}`
}

module.exports = function messageRender(data) {
  const { project, waterItems } = data

  let projectText = ''

  if (project) {
    const { percent, title, balance, target_amount } = project
    projectText = `${title} 当前进度 ${percent}% (${balance}/${target_amount})`
  }

  const dateDiff = moment('2019-10-20 19:00:00').fromNow(true)
  
  return `${waterItems.map(renderWater).join('\n')}\n谢谢爸爸!\n\n${projectText}\n\n距离陈甜心生日公演还有${dateDiff}`
}
