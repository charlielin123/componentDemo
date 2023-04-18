<script setup>
import { computed } from 'vue';
import { watch, toRefs, reactive, ref, onMounted } from 'vue';
//@ts-check
const inputClass = ref('');
const searching = () => {
  inputClass.value = 'searching';
};
const searched = () => {
  if (dataList.length > 0) {
    inputClass.value = 'searched';
  } else {
    inputClass.value = 'nothing';
  }
};
/**
 * @type {Readonly<{modelValue:string|null|Object,changeFunction:Function,config:{result,propertyName:string,trigger:boolean,defaultData:any,api:Function}}>}
 */
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
        result: null,
        propertyName: null,
        trigger: false,
        defaultData: '',
        api: () => {}
      };
    }
  }
});
const isObject = computed(() => {
  if (props.config.propertyName) {
    return true;
  }
  return false;
});

// eslint-disable-next-line vue/no-setup-props-destructure
const { propertyName } = props.config;
const emit = defineEmits(['update:modelValue', 'update:result']);
const { modelValue } = toRefs(props);
const { defaultData, trigger } = toRefs(props.config);
/**
 * 顯示清單
 * @type {reactive<string[]>}
 */
const dataList = reactive([]);
/**
 * @type {number}
 * @description 延遲搜尋時間 單位毫秒
 */
const timeDelay = 1000;
/**
 * 放置計時器物件
 * @type {number}
 */
let timer;
/**
 * 搜尋後暫存清單
 * @type {string[]}
 */
let tempList = [];

/**
 *
 * @param {Function} todo
 * @param {any} param
 */
const delayDo = (todo, param) => {
  timer = setTimeout(() => {
    todo(param);
  }, timeDelay);
};
onMounted(() => {
  if (isObject.value) {
    inputValue.value = defaultData.value[propertyName];
  } else {
    inputValue.value = defaultData.value;
  }
  tempList.length = 0;
  clearList();
});

watch([defaultData, trigger], () => {
  console.log('defaultData or trigger change');
  if (isObject.value) {
    // insideDefaultData.value = defaultData.value[props.config.propertyName]
    inputValue.value = defaultData.value[propertyName];
  } else {
    inputValue.value = defaultData.value;

    // insideDefaultData.value = defaultData.value
  }
  tempList.length = 0;
  clearList();
  clearTimeout(timer);
});
/**
 * 執行API並新增資料進tempList，過濾tempList內容放入dataList並顯示
 * @param {string} searchKey 查詢關鍵字
 */
const doSearch = async (searchKey) => {
  searching();
  /**
   * @type {string[]}
   */
  const res = (await props.config.api(searchKey)) || [];
  console.log(res);
  tempList = [...res];
  if (isObject.value) {
    Object.assign(
      dataList,
      tempList.filter((i) => i[propertyName].startsWith(searchKey))
    );
  } else {
    Object.assign(
      dataList,
      tempList.filter((i) => i.startsWith(searchKey))
    );
  }
  searched();
};
/**
 * 當
 * @param {Event} e
 */
const inputChange = (e) => {
  /**
   * @type {HTMLOptionElement}
   */
  const target = e.target;
  dataList.length = 0;
  clearTimeout(timer);
  // inputValue.value = target.value;

  // emit('update:modelValue', target.value)
  if (target.value == '') {
    return;
  }
  delayDo(doSearch, target.value);
};
/**
 * 當按下下拉清單中的項目時執行
 * 更改主元件與v-model綁定物件的值
 * 如果有放props.changeFunction 也會在此執行
 * @param {number} index
 */
const submit = (index) => {
  let tmp = [...dataList];
  let res;
  if (index != null) {
    res = tmp[index];
  } else {
    res = tmp[selectedIndex.value];
  }

  console.log(res);

  emit('update:result', res);
  // emit('update:modelValue', res)
  props.changeFunction();
  clearList();
};
const selectedIndex = ref(null);
const clearList = () => {
  dataList.length = 0;
  selectedIndex.value = null;
};
watch(modelValue, () => {
  inputValue.value = modelValue.value;
  defaultData.value = modelValue.value;
});

watch(selectedIndex, () => {
  if (selectedIndex.value == null) {
    return;
  }
  console.log(selectedIndex.value);
  document.querySelectorAll('.list .option').forEach((ele) => ele.classList.remove('hover'));
  if (selectedIndex.value != null) {
    document.querySelectorAll('.list .option')[selectedIndex.value].classList.add('hover');
  }
});

/**
 *
 */
function goDown() {
  if (dataList.length == 0) return;
  if (selectedIndex.value != null && selectedIndex.value != dataList.length - 1) {
    selectedIndex.value = selectedIndex.value + 1;
  } else {
    selectedIndex.value = 0;
  }
}

function goUp() {
  if (dataList.length == 0) return;
  if (selectedIndex.value != null && selectedIndex.value != 0) {
    selectedIndex.value = selectedIndex.value - 1;
  } else {
    selectedIndex.value = dataList.length - 1;
  }
}
const optionValueList = computed(() => {
  if (isObject.value) {
    console.log(dataList);
    return dataList.map((i) => {
      console.log(i[propertyName]);
      return i[propertyName];
    });
  }
  return dataList;
});
/**
 * @type {} input內顯示的字串
 */
const inputValue = ref('');
const blur = () => {
  if (isObject.value && defaultData.value[propertyName] == inputValue.value) {
    return;
  }
  if (!isObject.value && defaultData.value == inputValue.value) {
    return;
  }
  inputValue.value = '';
};
</script>

<template>
  <div style="width: 300px; position: relative; flex-direction: column" class="d-flex">
    <div class="d-flex">
      <input
        :class="inputClass"
        style="width: 100%; padding-right: 2rem; box-sizing: border-box"
        :value="inputValue"
        type="text"
        @keydown.down="goDown($event)"
        @keydown.up="goUp($event)"
        @keydown.enter="submit(index)"
        @input="inputChange($event)"
        @blur="blur"
      />
      <button
        class="btn btn-close"
        @click="clearList"
        style="position: absolute; right: 3px; top: 2px"
      ></button>
    </div>
    <div class="list">
      <template v-for="(item, index) in optionValueList" :key="item.value">
        <div class="border w-100 option" @click="submit(index)">
          {{ item }}
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
  animation: searching1 linear normal 1s;
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
  animation: searchFailed alternate-reverse 0.5s 3 ease-in-out;
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
