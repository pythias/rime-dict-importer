const shell = require('electron').shell;
const links = document.querySelectorAll('a[href]');

Array.prototype.forEach.call(links, (link) => {
  if (link.getAttribute('href').indexOf('http') === 0) {
    link.addEventListener('click', (e) => {
      const url = e.target.getAttribute('href');
      e.preventDefault();
      shell.openExternal(url);
    })
  }
})
