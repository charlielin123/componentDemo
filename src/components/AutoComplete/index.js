import AutoComplete from './AutoComplete.vue'
import {reactive} from 'vue';
/**
 * @class AutoCompleteConfig
 */
class AutoCompleteConfigClass {
  trigger = false
  api = () => {}
  defultData = ''
  // * trigger = false;

  setDefultData(defaultData) {
    this.defultData = defaultData || ''
    this.trigger = !this.trigger
  }
  /**
   * 
   * @param {Function} api 獲取清單的API Function
   */
  constructor(api){
    this.api = api;
  }
}

/**
   * 
   * @param {Function} api 獲取清單的API Function
   * @returns {AutoCompleteConfigClass} autoCompleteConfig
   */
function autoCompleteConfig(api) {
  const auto = new AutoCompleteConfigClass(api);
  return reactive(auto);
}

export { AutoComplete ,autoCompleteConfig}
