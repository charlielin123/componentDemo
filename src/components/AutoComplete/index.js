import AutoComplete from './AutoComplete.vue';
//@ts-check
import { reactive } from 'vue';
/**
 * @class AutoCompleteConfig
 */
class AutoCompleteConfigClass {
  trigger = false;
  /**
   * @type {Function}
   */
  api = () => {};

  defaultData = '';
  /**
   * @type {string|null}
   */
  propertyName = null;
  /**
   * @type {any}
   */
  result = null;
  // * trigger = false;

  setDefaultData(defaultData) {
    this.defaultData = defaultData || '';
    this.trigger = !this.trigger;
  }
  /**
   *
   * @param {Function} api 獲取清單的API Function
   */
  constructor(api) {
    this.api = api;
  }
}

/**
 *
 * @param {Function} api 設定get清單的API Function
 * @returns {import('vue').UnwrapNestedRefs<AutoCompleteConfigClass>} - reactive代理的 autoCompleteConfig物件
 */
function autoCompleteConfig(api) {
  const auto = new AutoCompleteConfigClass(api);
  return reactive(auto);
}

export { AutoComplete, autoCompleteConfig };
