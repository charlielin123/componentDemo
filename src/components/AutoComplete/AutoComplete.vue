<script setup>
import { watch, toRefs, reactive } from 'vue'
//@ts-check

const props = defineProps({
  modelValue: {
    type: [String,null],
    required: true
  },
  changeFunction: {
    type: Function,
    default:()=>{},
    required: false
  },
  config: {
    type: Object,
    required: true,
    default: () => {
      return {
        trigger: false,
        defultData: '',
        api: () => {}
      }
    }
  }
})

const emit = defineEmits(['update:modelValue'])
const { modelValue } = toRefs(props)
const { defultData, trigger } = toRefs(props.config)
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

watch([defultData, trigger], () => {
  console.log('defultData or trigger change')
  tempList.length = 0
  dataList.length = 0
  clearTimeout(timer)
})
/**
 * 執行API並新增資料進tempList，過濾tempList內容放入dataList並顯示
 * @param {string} searchKey 查詢關鍵字
 */
const doSearch = async (searchKey) => {
  /**
   * @type {string[]}
   */
  const res = await props.config.api(searchKey)
  console.log(res)
  tempList = [...tempList, ...res||[]]
  Object.assign(
    dataList,
    tempList.filter((i) => i.startsWith(searchKey))
  )
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
const clearList=()=>{
  dataList.length = 0
}
</script>

<template>
  <div style="width: 300px; position: relative; flex-direction: column" class="d-flex">
    <div class="d-flex">
      <input style="width: 100% ;padding-right: 2rem;" :value="modelValue" type="text" @input="inputChange($event)" />
      <button class="btn btn-close" @click="clearList" style="position: absolute; right: 3px;"></button>
    </div>
    <div class="list">
      <template v-for="item in dataList">
        <div class="border w-100 hover select" @click="changeValue(item)">
          {{ item }}
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
