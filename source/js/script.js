
var toggle_btn = document.querySelector('.js-menu-toggle-btn');
var toggle_menu = document.querySelector('.js-site-menu');

//начальная проверка доступности JavaScript
document.querySelector('body').classList.remove('no-js');
document.querySelector('body').classList.add('js');
//установка исходного состояния главного меню (закрыто)
toggle_btn.classList.remove('menu-toggle-btn--open');
toggle_menu.classList.add('site-navigation__list--close');


//обработка отрытия меню


toggle_btn.addEventListener('click', function() {
  if(this.classList.contains('menu-toggle-btn--open')) {
    this.classList.remove('menu-toggle-btn--open');
    toggle_menu.classList.add('site-navigation__list--close');
  }
  else {
    this.classList.add('menu-toggle-btn--open');
    toggle_menu.classList.remove('site-navigation__list--close');
  }

})
