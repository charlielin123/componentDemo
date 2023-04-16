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
    type: [String, null, Object],
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
  clearList()
}
const selectedIndex = ref(null)
const clearList = () => {
  dataList.length = 0
  selectedIndex.value = null
}

watch(selectedIndex, () => {
  if (selectedIndex.value == null) {
    return
  }
  console.log(selectedIndex.value)
  document.querySelectorAll('.list .option').forEach((ele) => ele.classList.remove('hover'))
  if (selectedIndex.value != null) {
    document.querySelectorAll('.list .option')[selectedIndex.value].classList.add('hover')
  }
  emit('update:modelValue', dataList[selectedIndex.value].value)
})

/**
 *
 */
function goDown() {
  // if (dataList.length == 0) return
  if (selectedIndex.value != null && selectedIndex.value != dataList.length - 1) {
    selectedIndex.value = selectedIndex.value + 1
  } else {
    selectedIndex.value = 0
  }
  console.log('DOWN')
}
function goUp() {
  if (dataList.length == 0) return
  if (selectedIndex.value != null && selectedIndex.value != 0) {
    selectedIndex.value = selectedIndex.value - 1
  } else {
    selectedIndex.value = dataList.length - 1
  }
  console.log('UP')
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
        @keydown.down="goDown($event)"
        @keydown.up="goUp($event)"
        @keydown.enter="clearList(), changeFunction()"
        @input="inputChange($event)"
      />
      <button
        class="btn btn-close"
        @click="clearList"
        style="position: absolute; right: 3px; top: 2px"
      ></button>
    </div>
    <div class="list">
      <template v-for="item in dataList" :key="item.value">
        <div class="border w-100 option" @click="changeValue(item.value)">
          {{ item.value }}
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.option {
  user-select: none;
  background-color: white;
  user-select: contain;

  cursor: pointer;
  &:hover {
    background-color: rgb(98, 179, 255);
  }
}
.hover {
  background-color: rgb(98, 179, 255);
}

@keyframes searching1 {
  from {
    box-shadow: -2px 2px 3px 1px rgb(255, 191, 0);
    // transform: scale(0);
  }
  45% {
    box-shadow: 2px 2px 3px 1px rgb(255, 191, 0);
    // transform: scale(0);
  }
  50% {
    box-shadow: 2px -2px 3px 1px rgb(255, 191, 0);
    // transform: scale(0);
  }
  95% {
    box-shadow: -2px -2px 3px 1px rgb(255, 191, 0);
    // transform: scale(0);
  }
  100% {
    box-shadow: -2px 2px 3px 1px rgb(255, 191, 0);
  }
}
.searching {
  animation: searching1 linear normal  1s;
  animation-iteration-count: infinite;
}
@keyframes searchFailed {
  from {
    box-shadow: 0 0 1px 1px red;
    // transform: scale(0);
  }
  to {
    box-shadow: 0 0 12px 6px red;
    // transform: scale(1);
  }
}

.nothing:focus {
  animation: searchFailed alternate-reverse .5s 3 ease-in-out;
}
.searched:focus {
  border: rgb(58, 249, 0) solid 0.2rem;
  box-shadow: 0 0 8px 3px rgb(34, 255, 0);
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
