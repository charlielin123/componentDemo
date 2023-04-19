<script setup>
import { computed, toRef } from 'vue';
import { watch, toRefs, reactive, ref, onMounted } from 'vue';
//@ts-check
function _uuid() {
  var d = Date.now();
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    d += performance.now(); //use high-precision timer if available
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}
const idBase=_uuid();


const props = defineProps({
  modelValue: {
    type: [String, Object],
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
        outPutProperty: 'id',
        showProperty: 'name',
        trigger: false,
        defaultData: '',
        api: () => {}
      };
    }
  }
});
const { trigger } = toRefs(props.config);
const emit = defineEmits(['update:modelValue']);

const inputValue = ref('');
const state = reactive({
  /**
   * @type {"static"|"searching"|"failed"|"complete"|"stop"}
   */
  status: 'static',
  optionList: [],
  selectedIndex: 0,
  selectedObj: {}
});
let timer;
const selectedIndex = toRef(state, 'selectedIndex');
/**
 * 0為string模式
 * 1為回傳指定Property
 * 2為回傳obj本身
 */
const model = computed(() => {
  if (typeof props.modelValue == 'string') {
    return 0;
  } else {
    return 1;
  }
});

const getValue = (obj) => {
  if (model.value == 0) return obj;
  return obj[props.config.showProperty];
};

const inputChange = (e) => {
  state.status = 'static';
  clearTimeout(timer);
  state.optionList = [];
  timer = setTimeout(async () => {
    state.status = 'searching';
    const res = await props.config.api(e.target.value);
    const ans = res.filter((obj) => {
      obj[props.config.showProperty].startsWith(e.target.value);
    });

    // @ts-ignore
    if (state.status == 'stop') {
      state.status = 'static';
      return;
    }
    Object.assign(state.optionList, ans);
    if (res.length > 0) {
      state.status = 'complete';
    } else {
      state.status = 'failed';
    }
    clearTimeout(timer);
  }, 2000);
};
const changeIndex = (index) => {
  state.selectedIndex = index;
};

const goUp = () => {
  if (state.optionList.length > 0 && state.selectedIndex == 0) {
    state.selectedIndex = state.optionList.length;
  } else {
    state.selectedIndex = state.optionList.length + 1;
  }
};
const goDown = () => {
  if (state.optionList.length > 0 && state.selectedIndex == state.optionList.length) {
    state.selectedIndex = state.optionList.length;
  } else {
    state.selectedIndex = state.optionList.length - 1;
  }
};

const submit = (index) => {
  if (index) state.selectedIndex = index;
  let finalData;
  if (model.value == 1 && props.config.outPutProperty != 'obj') {
    finalData = state.selectedObj[state.selectedIndex][props.config.outPutProperty];
  } else {
    finalData = state.selectedObj[state.selectedIndex];
  }

  emit('update:modelValue', finalData);
};
const clearList = () => {
  state.status = 'stop';
  state.optionList.length = 0;
  clearTimeout(timer);
};
const blur = () => {
  clearList();
  state.status = 'stop';
  if (props.config.outPutProperty == 'obj') {
    const tmp = props.config.outPutProperty;
    emit('update:modelValue', { [tmp]: '' });
    return;
  }
  emit('update:modelValue', '');
};

onMounted(() => {
  if (model.value == 0) {
    inputValue.value = props.config.defaultData;
  } else {
    inputValue.value = props.config.defaultData[props.config.showProperty];
  }
});

watch(trigger, () => {
  if (model.value == 0) {
    inputValue.value = props.config.defaultData;
  } else {
    inputValue.value = props.config.defaultData[props.config.showProperty];
  }
});

watch(selectedIndex, () => {
  document.getElementById(idBase+'select')?.querySelectorAll('.hover').forEach((ele)=>{
    ele.classList.remove('hover');
    if(ele.id==idBase+selectedIndex.value){
      ele.classList.remove('hover');

    }
  })
  if (state.optionList.length == 0) {
    return;
  }
  state.selectedObj = state.optionList[selectedIndex.value];
});
</script>

<template>
  <div style="width: 300px; position: relative; flex-direction: column" class="d-flex">
    <div class="d-flex">
      <input
        :class="state.status"
        style="width: 100%; padding-right: 2rem; box-sizing: border-box"
        :value="inputValue"
        type="text"
        @keydown.down="goDown()"
        @keydown.up="goUp()"
        @keydown.enter="submit()"
        @input="inputChange($event)"
        @blur="blur"
      />
      <button
        class="btn btn-close"
        @click="clearList"
        style="position: absolute; right: 3px; top: 2px"
      ></button>
    </div>
    <div class="list" :id="idBase+'select'">
      <template v-for="(item, index) in state.optionList" :key="item.value">
        <div class="border w-100 option" :id="idBase+index" @mouseover="changeIndex(index)" @click="submit(index)">
          {{ getValue(item) }}
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

.fail:focus {
  animation: searchFailed alternate-reverse 0.5s 3 ease-in-out;
}
.success:focus {
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
