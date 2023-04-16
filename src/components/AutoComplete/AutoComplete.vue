<script setup>
import { watch, toRefs, reactive, ref } from 'vue'
//@ts-check
const inputClass = ref('')
const searching = () => {
  inputClass.value = 'searching'
}
const searched = () => {
  if (dataList.length > 0) {
    inputClass.value = 'searched'
  } else {
    inputClass.value = 'nothing'
  }
}
const props = defineProps({
  modelValue: {
    type: [String, null],
    required: true
  },
  changeFunction: {
    type: Function,
    default: () => {},
    required: false
  },
  config: {
    type: Object,
    required: true,
    default: () => {
      return {
        trigger: false,
        defaultData: '',
        api: () => {}
      }
    }
  }
})

const emit = defineEmits(['update:modelValue'])
const { modelValue } = toRefs(props)
const { defaultData, trigger } = toRefs(props.config)
/**
 * 顯示清單
 * @type {reactive<string[]>}
 */
const dataList = reactive([])
/**
 * @type {number}
 * @description 延遲搜尋時間 單位毫秒
 */
const timeDelay = 1000
/**
 * 放置計時器物件
 * @type {number}
 */
let timer
/**
 * 搜尋後暫存清單
 * @type {string[]}
 */
let tempList = []

/**
 *
 * @param {Function} todo
 * @param {any} param
 */
const delayDo = (todo, param) => {
  timer = setTimeout(() => {
    todo(param)
  }, timeDelay)
}

watch([defaultData, trigger], () => {
  console.log('defaultData or trigger change')
  tempList.length = 0
  dataList.length = 0
  clearTimeout(timer)
})
/**
 * 執行API並新增資料進tempList，過濾tempList內容放入dataList並顯示
 * @param {string} searchKey 查詢關鍵字
 */
const doSearch = async (searchKey) => {
  searching()
  /**
   * @type {string[]}
   */
  const res = (await props.config.api(searchKey)) || []
  // console.log(res)
  const resPulsId = res.map((x) => {
    return {
      value: x,
      key: Symbol()
    }
  })
  tempList = [...tempList, ...(resPulsId || [])]
  Object.assign(
    dataList,
    tempList.filter((i) => i.value.startsWith(searchKey))
  )
  searched()
}
/**
 * 當
 * @param {Event} e
 */
const inputChange = (e) => {
  /**
   * @type {HTMLOptionElement}
   */
  const target = e.target
  dataList.length = 0
  clearTimeout(timer)
  emit('update:modelValue', target.value)
  if (target.value == '') {
    return
  }
  delayDo(doSearch, target.value)
}
/**
 * 當按下下拉清單中的項目時執行
 * 更改主元件與v-model綁定物件的值
 * 如果有放props.changeFunction 也會在此執行
 * @param {string} selectValue
 */
const changeValue = (selectValue) => {
  emit('update:modelValue', selectValue)
  props.changeFunction()
  dataList.length = 0
}
const clearList = () => {
  dataList.length = 0
}
</script>

<template>
  <div style="width: 300px; position: relative; flex-direction: column" class="d-flex">
    <div class="d-flex">
      <input
        :class="inputClass"
        style="width: 100%; padding-right: 2rem; box-sizing: border-box"
        :value="modelValue"
        type="text"
        @input="inputChange($event)"
      />
      <button
        class="btn btn-close"
        @click="clearList"
        style="position: absolute; right: 3px; top: 2px"
      ></button>
    </div>
    <div class="list">
      <template v-for="item in dataList" :key="item.key">
        <div class="border w-100 hover select" @click="changeValue(item.value)">
          {{ item.value }}
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.select {
  user-select: none;
}
.hover {
  background-color: white;
  &:focus {
    background-color: pink;
  }
  cursor: pointer;
  &:hover {
    background-color: rgba(0, 0, 255);
  }
}
input {
  // box-sizing: border-box;
  // &:focus{
  //   border: rgb(0, 0, 0) solid 0.2rem;
  //   box-shadow: 0px 0px 0 2px rgb(255, 255, 255);
  // }
}

@keyframes searching1 {
  from {
    border: yellow solid 0.2rem;
    box-shadow: 0 0 1px 1px rgb(255, 191, 0);
    // transform: scale(0);
  }
  50% {
    border: rgb(255, 153, 0) solid 0.2rem;
    box-shadow: 0 0 3px 3px rgb(255, 187, 0);
    // transform: scale(1);
  }
  to {
    border: rgb(255, 98, 0) solid 0.2rem;
    box-shadow: 0 0 6px 6px rgb(255, 123, 0);
    // transform: scale(2);
  }
}
.searching {
  animation: searching1 linear alternate-reverse 1s;
  animation-iteration-count: 10;
  border: rgb(249, 203, 0) solid 0.2rem;
}
.nothing,
.nothing:focus,
.nothing::marker {
  border: rgb(249, 71, 0) solid 0.2rem;
  box-shadow: 0 0 5px 0px RED;
}
.searched {
  border: rgb(58, 249, 0) solid 0.2rem;
  box-shadow: 0 0 5px 0px rgb(34, 255, 0);
}
.list {
  color: black;
  max-height: 250px;
  margin-top: 2rem;
  overflow-y: auto;
  max-height: 300px;
  width: inherit;
  position: fixed;
  z-index: 999999;
}
</style>
