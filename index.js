/*
 * @Author: Jafish 
 * @Date: 2017-12-26 15:56:30 
 * @Last Modified by: Jafish
 * @Last Modified time: 2018-01-30 14:37:27
 */
((win, doc) => {
   // 方便查询元素
   let _$ = (selector, node) => (node || doc).querySelector(selector)

   function CommandDialog(callback, config = {}) {
      if (callback && typeof callback !== 'function') throw new Error('callback is not a function')

      this.viewTitle = config.title || '输口令进搞酒赢大奖' // 弹窗标题
      this.viewSubTitle = config.subTitle || '千万豪礼等你来抢' // 弹窗副标题
      this.submitEvent = callback // 点击确定按钮的事件
      this.eventListValue = this.eventList() // 获取事件列表
      this.htmlNode = _$('html') // 获取html节点，用来设置宽高100%占满全屏
      this.bodyNode = _$('body') // 获取body节点
      this.htmlStyle = this.htmlNode.style.cssText // 获取html的style值
      this.bodyStyle = this.bodyNode.style.cssText // 获取body的style值

      this.showCommand() // 显示输口令界面

      // 节点创建完成后获取节点
      this.shadowNode = _$('.command_dialog_shadow', this.bodyNode) // 遮罩层节点
      this.removeShadowNode = _$('.CD_shadow_remove', this.shadowNode) // 删除遮罩层的节点
      this.placeholderNode = _$('.CD_input_placeholder', this.shadowNode) // 提示语言的节点
      this.inputNode = _$('.CD_input', this.shadowNode) // 输入框节点
      this.removeImgNode = _$('.CD_input_remove', this.shadowNode) // 删除图标的节点
      this.hintNode = _$('.CD_hint', this.shadowNode) // 提示的节点
      this.submitNode = _$('.CD_submit', this.shadowNode) // 确定的节点

      // 检测是否支持touch事件
      this.onTouchEnd = 'ontouchend' in this.bodyNode ? 'touchend' : 'click'

      this.addEvent() // 绑定事件
   }

   CommandDialog.prototype.showCommand = function () {
      // 显示输口令界面
      console.log('显示输入口令界面')
      var shadowNode = doc.createElement('div')
      shadowNode.className = 'command_dialog_shadow'
      shadowNode.innerHTML = `<div class="CD_box">
         <div class="CD_shadow_remove"></div>
         <div class="CD_title"><div class="CD_text_main">${this.viewTitle}</div><div class="CD_text_middle"></div></div>
         <div class="CD_remark"><div class="CD_text_main">${this.viewSubTitle}</div><div class="CD_text_middle"></div></div>

            <div class="CD_input_box">
               <div class="CD_input_placeholder">输入口令</div>
               <input class="CD_input" type="text" />
               <div class="CD_input_remove"></div>
            </div>

         <div class="CD_hint"></div>

         <div class="CD_submit">确定</div>
      </div>`

      // 添加节点
      this.bodyNode.appendChild(shadowNode)
      // 固定屏幕
      let addStyle = 'width: 100%;height: 100%;overflow: hidden;position: relative;'
      this.htmlNode.style.cssText = this.htmlStyle + addStyle
      this.bodyNode.style.cssText = this.bodyStyle + addStyle

      return true
   }

   CommandDialog.prototype.addEvent = function () {
      // 绑定事件
      let eventListValue = this.eventListValue,
      onTouchEnd = this.onTouchEnd

      this.removeShadowNode.addEventListener(onTouchEnd, eventListValue.removeShadowEvent)
      this.placeholderNode.addEventListener(onTouchEnd, eventListValue.placeholderEvent)
      this.inputNode.addEventListener('input', eventListValue.inputChange)
      this.inputNode.addEventListener('focus', eventListValue.inputFocus)
      this.inputNode.addEventListener('blur', eventListValue.inputBlur)
      this.removeImgNode.addEventListener(onTouchEnd, eventListValue.removeValue)
      this.submitNode.addEventListener(onTouchEnd, eventListValue.onSubmitEvent)
   }

   CommandDialog.prototype.removeEvent = function (bestop = true, callback) {
      // bestop：输入是否正确, false -> 出错了
      if (!bestop) {
         // 答案错误
         this.hintNode.innerHTML = '口令输入错误！'

         return false
      } else {
         // 答案正常则移除事件
         let eventListValue = this.eventListValue,
            onTouchEnd = this.onTouchEnd

         this.removeShadowNode.removeEventListener(onTouchEnd, eventListValue.removeShadowEvent)
         this.placeholderNode.removeEventListener(onTouchEnd, eventListValue.placeholderEvent)
         this.inputNode.removeEventListener('input', eventListValue.inputChange)
         this.inputNode.removeEventListener('focus', eventListValue.inputFocus)
         this.inputNode.removeEventListener('blur', eventListValue.inputBlur)
         this.removeImgNode.removeEventListener(onTouchEnd, eventListValue.removeValue)
         this.submitNode.removeEventListener(onTouchEnd, eventListValue.onSubmitEvent)

         // 移除节点
         this.bodyNode.removeChild(this.shadowNode)
         // 取消屏幕固定
         this.htmlNode.style.cssText = this.htmlStyle
         this.bodyNode.style.cssText = this.bodyStyle

         // 释放节点
         this.htmlNode = null
         this.bodyNode = null
         this.shadowNode = null
         this.removeShadowNode = null
         this.placeholderNode = null
         this.inputNode = null
         this.removeImgNode = null
         this.hintNode = null
         this.submitNode = null

         // 确认之后的回调函数
         typeof callback === 'function' && callback()
      }
   }

   CommandDialog.prototype.eventList = function () {
      // 事件列表
      return {
         removeShadowEvent: e => {
            // 删除遮罩事件
            this.removeEvent()
         },
         placeholderEvent: e => {
            // 提示语句的点击事件
            try {
               this.placeholderNode.style.cssText = 'display: none;'
               this.placeholderNode.parentNode.removeChild(this.placeholderNode)
            } catch (error) {
               this.placeholderNode.parentNode.removeChild(this.placeholderNode)
            }

            this.inputNode.focus()
         },
         inputChange: e => {
            // 输入框输入事件
            let value = e.target.value,
               visibility = value ? 'visible;' : 'hidden;'

            this.removeImgNode.style.cssText = 'visibility: ' + visibility
         },
         inputFocus: e => {
            // 输入框得到焦点
            this.hintNode.innerHTML = ''
         },
         inputBlur: e => {
            // 输入框失去焦点
            let value = e.target.value

            if (!value) {
               // 输入框没有值
               this.hintNode.innerHTML = '请输入口令！'
            }
         },
         removeValue: e => {
            // 清空输入框信息
            this.inputNode.value = ''
            this.inputNode.focus()

            this.removeImgNode.style.cssText = 'visibility: hidden;'
         },
         onSubmitEvent: e => {
            // 点击确定 校验
            let value = this.inputNode.value
            if (!value) {
               // 输入框没有值
               this.hintNode.innerHTML = '请输入口令！'
               return false
            }

            this.submitEvent(value, this.removeEvent.bind(this))
         },
      }
   }

   win.CommandDialog = (callback, config) => new CommandDialog(callback, config) // 显示
})(window, document)