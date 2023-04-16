<script>
// @ts-check
// 使用普通的 <script> 来声明选项
export default {
  inheritAttrs: false
}
</script>
<script setup>
import { ref, computed } from 'vue'

const props = defineProps(['show', 'body_style', 'dis_close_btn', 'dis_close_icon', 'backdrop'])

const emit = defineEmits(['update:show'])
const close = () => {
  emit('update:show', false)
}

/**
 * 檢測父組件是否有對應的prop 如有返回false 用來切換部分元素的顯示
 * @param {"dis_close_btn" | "dis_close_icon"} propsName
 */
const switchFunction = (propsName) => {
  if (props[propsName] === '' || props[propsName] === true || props[propsName] === 'true') {
    return false
  }
  return true
}
/**
 * 點擊燈箱外觸發
 * 如果有prop backdrop 則關閉視窗
 */
const clickOutside = () => {
  if (props.backdrop == '') {
    close()
  } else {
    addClass.value = 'pop'
    const t = setTimeout(() => {
      addClass.value = ''
      clearInterval(t)
    }, 500)
  }
}

/**
 * 用來判斷是否顯示footer的關閉按鈕
 * @type {ComputedRef<boolean>}
 * @returns {boolean}
 */
const closeBtnSwitch = computed(() => {
  return switchFunction('dis_close_btn')
})
/**
 * 用來判斷是否顯示title的X按鈕
 * @type {ComputedRef<boolean>}
 * @returns {boolean}
 */
const closeIconSwitch = computed(() => {
  return switchFunction('dis_close_icon')
})
/**
 * @type {Ref<string>}
 */
const addClass = ref('')
</script>

<template>
  <transition name="lightBox">
    <div class="outSideContainer" v-if="show" @click.prevent.stop="clickOutside()">
      <div class="lightBox" :="$attrs" @click.prevent.stop="" :class="addClass">
        <div class="header">
          <h5 class="title">
            <slot name="titel">警告</slot>
          </h5>
          <button
            class="btn-close"
            v-if="closeIconSwitch"
            @click="
              close(),
              $emit('update:show', false)
            "
          ></button>
        </div>
        <div class="lightBoxBody" :style="body_style">
          <slot name="body">警告</slot>
        </div>
        <div class="footer">
          <slot name="footer"> </slot>

          <button @click="close()" v-if="closeBtnSwitch">關閉</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style lang="scss" scoped>
@keyframes test {
  from {
    transform: scale(1);
  }
  25% {
    transform: scale(1.02);
  }
  to {
    transform: scale(1);
  }
}
.pop {
  animation: test ease-in-out 0.3s forwards;
}

.outSideContainer {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1055;
  background-color: rgba(0, 0, 0, 0.5);
  // opacity: 0.5;
  display: flex;
  justify-content: center;
  align-items: center;

  .lightBox {
    z-index: 1056;
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 10rem;
    pointer-events: auto;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid rgba(0, 0, 0, 0.2);
    border-radius: 0.3rem;
    outline: 0;
    .header {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1rem;
      border-bottom: 1px solid #dee2e6;
      border-top-left-radius: calc(0.3rem - 1px);
      border-top-right-radius: calc(0.3rem - 1px);
      .title {
        padding: 0;
        margin: 0;
        margin-bottom: 0;
        line-height: 1.5rem;
        font-size: 1.5rem;
      }
      .btn-close {
        box-sizing: content-box;
        width: 1em;
        height: 1em;
        padding: 0.5rem 0.5rem;
        color: #000;
        opacity: 0.5;
        cursor: pointer;

        background: transparent
          url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23000'%3e%3cpath d='M.293.293a1 1 0 011.414 0L8 6.586 14.293.293a1 1 0 111.414 1.414L9.414 8l6.293 6.293a1 1 0 01-1.414 1.414L8 9.414l-6.293 6.293a1 1 0 01-1.414-1.414L6.586 8 .293 1.707a1 1 0 010-1.414z'/%3e%3c/svg%3e")
          center/1em auto no-repeat;

        border: 0;
        border-radius: 0.25rem;
      }
    }
    .lightBoxBody {
      overflow-y: auto;
      overflow-x: hidden;
      padding: 1rem;
      position: relative;
      flex: 1 1 auto;
    }
    .footer {
      display: flex;
      flex-wrap: wrap;
      flex-shrink: 0;
      align-items: center;
      justify-content: flex-end;
      padding: 0.75rem;
      border-top: 1px solid #dee2e6;
      border-bottom-right-radius: calc(0.3rem - 1px);
      border-bottom-left-radius: calc(0.3rem - 1px);
      button {
        color: #fff;
        margin: 0.25rem;
        background-color: #6c757d;
        border-color: #6c757d;
        display: inline-block;
        font-weight: 400;
        line-height: 1.5rem;
        text-align: center;
        text-decoration: none;
        vertical-align: middle;
        cursor: pointer;
        -webkit-user-select: none;
        -moz-user-select: none;
        user-select: none;
        // background-color: transparent;
        border: 1px solid transparent;
        padding: 0.375rem 0.75rem;
        font-size: 1rem;
        border-radius: 0.25rem;
        transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
          border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
      }
    }
  }
}

.lightBox-enter-active,
.lightBox-leave-active {
  transition: all 0.15s linear;
}

.lightBox-enter-from,
.lightBox-leave-to {
  // transform: translateX(-50px);
  opacity: 0;
}
.lightBox-enter-active .lightBox,
.lightBox-leave-active .lightBox {
  transition: all 0.3s ease-out;
}

.lightBox-enter-from .lightBox,
.lightBox-leave-to .lightBox {
  transform: translateY(-50px);
}
</style>
