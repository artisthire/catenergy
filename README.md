<table>
  <thead>
    <tr>
      <th>Команда</th>
      <th>Результат</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td width="22%"><code>npm i</code></td>
      <td>Установить зависимости</td>
    </tr>
    <tr>
      <td><code>npm start</code></td>
      <td>Запустить сборку, сервер и слежение за файлами</td>
    </tr>
    <tr>
      <td><code>npm run build</code></td>
      <td>Сборка проекта без карт кода (сжатый вид, как результат работы)</td>
    </tr>
    <tr>
      <td><code>npm start ЗАДАЧА</code></td>
      <td>Запустить задачу с названием ЗАДАЧА (список задач в <code>gulpfile.js</code>)</td>
    </tr>
  </tbody>
</table>

## Парадигма

- Используется именование классов, файлов и переменных по БЭМ.
- Каждый БЭМ-блок в отдельном файле внутри `source/blocks/`.
- Диспетчер подключения стилей `source/scss/style.scss` содержит ссылки на все файлы БЭМ-блоков `source/blocks/*.scss`. В этом файле, при необходимости, подключаются ссылки на css файлы библиотек зависимостей.
- Глобальные стили и переменные для scss находятся в общей папке `source/scss/`.
- Для инлайнинга картинок css используются плагины [postcss-inline-svg] (https://github.com/TrySound/postcss-inline-svg) и [postcss-image-inliner] (https://www.npmjs.com/package/postcss-image-inliner).
- Для разметки html используется [шаблонизация] (https://www.npmjs.com/package/gulp-file-include).
- в отдельной директории `source/libs` находятся файлы css, js, которые нужно по каким-то причинам копировать отдельными файлами в проект. Файлы копируются без модификаций.
- Глобальные стили, js, шрифты, картинки находятся в отдельных директориях.
- Файлы JS сторонних библиотек, которые нужно добавить в общий файл script.js, подключаются при указании ссылок на них в переменной patch.libs.js файла gulpfile.js


## Назначение папок

```bash
build/          # Папка сборки.
source/            # Исходные файлы
  blocks/       # - БЭМ-блоки проекта
  blocks/img_inline_css       # - картинки для инлайнинга в css
  blocks/svg_inline_css       # - svg для инлайнинга в css
  fonts/        # - внешние шрифты
  html_templates/     # - фрагменты html для вставки на страницы
  img/          # - глобальная папка для картинок, из нее генерируется минизированные картинки и картинки в формате webp
  img/favicon         # - содержит фавиконки, копируется как есть без обработки
  img/sprite-svg         # - содержит svg-файлы, которые объединяются в один svg-спрайт для подключения в html
  js/           # - содержит js-файлы, написанные для проекта
  libs/           # - содержит отдельные файлы js и css, которые нужно копировать в проект отдельными файлами без модификации.
  scss/         # - содержит общие файлы scss и файл-диспетчер подключений для всех блоков из папки 'blocks'
  index.html    # - главная страница проекта
```


### Стили

Файл-диспетчер подключений (`source/scss/style.scss`).
Файл с общими переменными (`source/scss/variables.scss`).
Файл с общей стилизацией (`source/scss/scaffolding.scss`).

Используемый постпроцессинг:

1. [autoprefixer](https://github.com/postcss/autoprefixer)
2. [css-mqpacker](https://github.com/hail2u/node-css-mqpacker)
3. [postcss-inline-svg] (https://github.com/TrySound/postcss-inline-svg)
4. [postcss-image-inliner] (https://www.npmjs.com/package/postcss-image-inliner)
5. [cssnano](https://github.com/cssnano/cssnano) (только при генерации для продакшина)
