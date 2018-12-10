
var toggle_btn = document.querySelector('.js-menu-toggle-btn');
var toggle_menu = document.querySelector('.js-site-menu');

// для добавления интерактивной карты с контактами
var map_container = document.querySelector('.js-map-container');
var map_backup = document.querySelector('.js-map-backup');

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
});

var map_container = document.getElementById('main_contacts_map');
var map_backup = document.getElementById('main_contacts_map_backup');
//получаем ширину страницы браузера для изменения карты
var screen_width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

var map = L.map(map_container, {scrollWheelZoom: false});
var map_pin_width = 56;
var map_pin_height = 53;
var lat = 59.938727;
var lng = 30.323085;


// инициализация карты
initMap();

// изменение вида карты для разных вьюпортов
window.addEventListener('resize', function() {
  screen_width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

  if (screen_width >= 768) {
    map_pin_width = 113;
    map_pin_height = 106;
  }

  if (screen_width >= 1440) {
    //на версии для десктопа центр карты смещаем вправо
    map.setView([59.939012, 30.317150], 17);
  }
  else if (screen_width >= 768) {
    map.setView([lat, lng], 18);
  }
  else {
    map.setView([lat, lng], 17);
  }
});

function initMap() {
  //скрываем картинку для бэкапа если JS не работает
  //показываем блок для дальнейшего размещения в нем карты
  map_backup.style.display = 'none';
  map_container.style.display = "block";

  // var lat = 59.938727;
  // var lng = 30.323085;

  if (screen_width >= 768) {
    map_pin_width = 113;
    map_pin_height = 106;
  }

  var map_pin_anchor_g = Math.round(map_pin_width / 2);
  var map_pin_anchor_v = map_pin_height - 1;

  if (screen_width >= 1440) {
    //на версии для десктопа центр карты смещаем вправо
    map.setView([59.939012, 30.317150], 17);
  }
  else if (screen_width >= 768) {
    map.setView([lat, lng], 18);
  }
  else {
    map.setView([lat, lng], 17);
  }

	L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3'],
    attribution: '&copy; <a href="https://www.google.com/permissions/geoguidelines/">Google Maps</a> contributors'
  }).addTo(map);

  var myIcon = L.icon({
    iconUrl: '../img/map-pin.png',
    iconSize: [map_pin_width, map_pin_height],
    iconAnchor: [map_pin_anchor_g, map_pin_anchor_v]
  });

  L.marker([lat, lng], {icon: myIcon}).addTo(map);
}
