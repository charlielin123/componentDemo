import AutoComplete from './AutoComplete.vue'
//@ts-check
import { reactive } from 'vue'
/**
 * @class AutoCompleteConfig
 */
class AutoCompleteConfigClass {
  trigger = false
  /**
   * @type {Function}
   */
  api = () => {}
  defaultData = ''
  // * trigger = false;

  setDefaultData(defaultData) {
    this.defaultData = defaultData || ''
    this.trigger = !this.trigger
  }
  /**
   *
   * @param {Function} api 獲取清單的API Function
   */
  constructor(api) {
    this.api = api
  }
}

/**
 *
 * @param {Function} api 獲取清單的API Function
 * @returns {AutoCompleteConfigClass} autoCompleteConfig
 */
function autoCompleteConfig(api) {
  const auto = new AutoCompleteConfigClass(api)
  return reactive(auto)
}

export { AutoComplete, autoCompleteConfig }
