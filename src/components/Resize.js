/**
 *
 * @param {HTMLElement} el
 * @param {*} bind
 * @param {*} vNode
 */
export const Resizable = (el, bind, vNode) => {
  let resizing = false;
  let resizeDirection;
  let startX = 0;
  let startY = 0;
  let startTop;
  let startLeft;
  let startWidth = 0;
  let startHeight = 0;
  let windowWidth = 0;
  let windowHeight = 0;
  const initResize = (e) => {
    e.preventDefault();
    e.stopPropagation();
    resizing = true;
    resizeDirection = e.target.className;
    startX = e.clientX;
    startY = e.clientY;
    startWidth = el.clientWidth;
    startHeight = el.clientHeight;
    windowHeight = window.innerHeight;
    windowWidth = window.innerWidth;
    startTop = el.offsetTop;
    startLeft = el.offsetLeft;

    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
  };
  const ref = [
    'top',
    'right',
    'bottom',
    'left',
    'topLeft',
    'topRight',
    'bottomLeft',
    'bottomRight'
  ];
  el.style.position = 'absolute';
  for (let i = 0; i < ref.length; i++) {
    let ele = document.createElement('div');
    ele.classList.add(ref[i]);
    ele.addEventListener('mousedown', initResize);
    const mixCss = { ...resizeHandle, ...style[ref[i]] };
    for (const key in mixCss) {
      ele.style[key] = mixCss[key];
    }
    el.appendChild(ele);
  }

  const resize = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!resizing) return;
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    const eStyle = el.style;
    const topAction = () => {
      eStyle.top = '';
      eStyle.bottom = plusPx(windowHeight - startHeight - startTop);
      eStyle.height = plusPx(startHeight - deltaY);
    };
    const bottomAction = () => {
      eStyle.bottom = '';
      eStyle.top = plusPx(startTop);
      eStyle.height = plusPx(startHeight + deltaY);
    };
    const leftAction = () => {
      eStyle.left = '';
      eStyle.right = plusPx(windowWidth - startWidth - startLeft);
      eStyle.width = plusPx(startWidth - deltaX);
    };

    const rightAction = () => {
      eStyle.right = '';
      eStyle.left = plusPx(startLeft);
      eStyle.width = plusPx(startWidth + deltaX);
    };

    switch (resizeDirection) {
      case 'top':
        topAction();
        break;
      case 'right':
        rightAction();
        break;
      case 'bottom':
        bottomAction();
        break;
      case 'left':
        leftAction();
        break;
      case 'topLeft':
        topAction();
        leftAction();
        break;
      case 'topRight':
        topAction();
        rightAction();
        break;
      case 'bottomLeft':
        bottomAction();
        leftAction();
        break;
      case 'bottomRight':
        bottomAction();
        rightAction();
        break;
    }
  };
  const stopResize = () => {
    resizing = false;
    resizeDirection = '';
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', stopResize);
  };
};
const plusPx = (a) => {
  return a + 'px';
};

const resizeHandle = {
  position: 'absolute',
  zIndex: '1056',
  width: '10px',
  height: '10px'
  // backgroundColor: 'rgb(240, 0, 0)'
  // border: 1px solid black;
};

const top = {
  top: '-5px',
  left: '50%',
  width: 'calc(100% - 10px)',
  transform: 'translateX(-50%)',
  cursor: 'ns-resize'
};

const right = {
  top: '50%',
  right: '-5px',
  height: 'calc(100% - 10px)',
  transform: 'translateY(-50%)',
  cursor: 'ew-resize'
};

const bottom = {
  bottom: '-5px',
  left: '50%',
  width: 'calc(100% - 10px)',
  transform: 'translateX(-50%)',
  cursor: 'ns-resize'
};

const left = {
  top: '50%',
  left: '-5px',
  height: 'calc(100% - 10px)',
  transform: 'translateY(-50%)',
  cursor: 'ew-resize'
};

const topLeft = {
  top: '-5px',
  left: '-5px',
  cursor: 'nwse-resize'
};

const topRight = {
  top: '-5px',
  right: '-5px',
  cursor: 'nesw-resize'
};

const bottomLeft = {
  bottom: '-5px',
  left: '-5px',
  cursor: 'nesw-resize'
};

const bottomRight = {
  bottom: '-5px',
  right: '-5px',
  cursor: 'nwse-resize'
};
const style = {
  top,
  right,
  bottom,
  left,
  topLeft,
  topRight,
  bottomLeft,
  bottomRight
};

/**
 *
 * @param {HTMLElement} el
 * @param {*} bind
 * @param {*} vNode
 */
export const draggable = (el, bind, vNode) => {
  let dragging = false;
  let startX = 0;
  let startY = 0;
  let startTop = 0;
  let startLeft = 0;

  const startHeight = el.clientHeight;
  const startWidth = el.clientWidth;
  let dragBar = bind.value;
  if (!(dragBar instanceof HTMLElement)) {
    dragBar = document.querySelector(dragBar);
  }
  if (!dragBar) return;
  dragBar.style.cursor = 'move';
  // console.log(bind.value)
  const initDrag = (event) => {
    event.preventDefault();
    event.stopPropagation();
    dragging = true;
    startX = event.clientX;
    startY = event.clientY;
    startTop = el.offsetTop;
    startLeft = el.offsetLeft;
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
  };
  let f11 = false;
  /**
   * 
   * @param {MouseEvent} event 
   * @returns 
   */
  const drag = (event) => {
    if (!dragging) return;

    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    if (f11 && deltaY > 0) {
      el.style.width = startWidth + 'px';
      el.style.height = startHeight + 'px';
      startX = event.clientX;
      startY = event.clientY;
      startTop = event.clientY;
      startLeft = event.clientX;
      f11 = false;
      return;
    }

    let top = startTop + deltaY;
    let left = startLeft + deltaX;
    if (top + 10 >= window.innerHeight - el.clientHeight) {
      top = window.innerHeight - el.clientHeight;
    }
    if (top <= 10) {
      top = 0;
      el.style.width = window.innerWidth + 'px';
      el.style.height = window.innerHeight + 'px';
      f11 = true;
    }
    if (left <= 10) {
      left = 0;
    }
    if (left + 10 > window.innerWidth - el.clientWidth) {
      left = window.innerWidth - el.clientWidth;
    }

    el.style.top = plusPx(top);
    el.style.left = plusPx(left);
  };

  const stopDrag = () => {
    dragging = false;
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDrag);
  };

  dragBar.addEventListener('mousedown', initDrag);
};
