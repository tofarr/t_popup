"use strict";
import onAnimEnd from '/src/js/on_anim_end.js';

const defaults = {
  parent : null,
  className: 't-popup',
  classes: ['fade'],
  containerClassName: 't-popup-container',
  content: 'Override Content with DOM Element or String!',
  isOpen: true,
  outsideClickCloses: true,
  destroyOnClose: true
}

function TPopup(attrs){
  const state = Object.assign({}, defaults, attrs);
  const element = document.createElement('div');
  element.classList.add(state.className);
  state.classes.forEach((className) => {
    element.classList.add(className);
  });
  const container = document.createElement('div');
  container.className = state.containerClassName;
  element.appendChild(container);
  if(typeof state.content == 'string'){
    container.innerHTML = state.content;
  }else{
    if(state.content.parentNode){
      state.content.parentNode.removeChild(state.content);
    }
    container.appendChild(state.content);
  }
  this.element = element;
  this.destroyOnClose = state.destroyOnClose;
  (state.parent || document.body).appendChild(this.element);
  if(state.isOpen){
    TPopup.prototype.open.call(this);
  }else{
    this.element.classList.add('closed');
  }
  if(state.outsideClickCloses){
    element.addEventListener('click', (event) => {
      if(event.target == this.element){
        this.close();
      }
    })
  }
}

function transition(remove, add){
  this.element.classList.remove(remove);
  this.element.classList.add(add);
  return onAnimEnd(this.element);
}

TPopup.prototype.open = function(){
  return new Promise((resolve) => {
    transition.call(this, 'closed', 'opening').then(() => {
      transition.call(this, 'opening', 'open').then(resolve);
    });
  });
}

TPopup.prototype.close = function(){
  return new Promise((resolve) => {
    transition.call(this, 'open', 'closing').then(() => {
      transition.call(this, 'closing', 'closed').then(resolve);
    });
  });
}

TPopup.prototype.isOpen = function(){
  return this.element.classList.contains('open')
    || this.element.classList.contains('opening');
}

TPopup.prototype.destroy = function(){
  if(!this.element){ return; }
  this.element.parentNode.removeChild(this.element);
  this.element = null;
}

TPopup.prototype.isDestroyed = function(){
  return !this.element;
}

window.TPopup = TPopup;
