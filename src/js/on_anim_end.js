
const endEvents = ['webkitAnimationEnd', 'oanimationend', 'msAnimationEnd', 'animationend'];

function hasCssAnimation(el) {
  var items = [el].concat(Array.prototype.slice.call(el.getElementsByTagName("*")));
  for (var i = 0; i < items.length; i++) {
    var style = window.getComputedStyle(items[i], null);
    var animDuration = parseFloat(style.getPropertyValue('animation-duration') || '0');
    var transDuration = parseFloat(style.getPropertyValue('transition-duration') || '0');
    if (animDuration > 0 || transDuration > 0) {
      return true;
    }
  }
  return false;
}

export default function onAnimEnd(element){
  return new Promise((resolve) => {
    function callback(){
      endEvents.forEach((event) => {
        element.removeEventListener(event, callback);
      });
      resolve();
    }
    if(hasCssAnimation(element)){
      endEvents.forEach((event) => {
        element.addEventListener(event, callback);
      });
    }else{
      callback();
    }
  });
}
