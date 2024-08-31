
// document.addEventListener('DOMContentLoaded', () => {
//     const path = window.location.pathname;
//     let currentPage = '';

//     if (path.includes('tournaments')) {
//         currentPage = 'tournaments';
//     } else if (path.includes('home')) {
//         currentPage = 'home';
//     } else if (path.includes('profile')) {
//         currentPage = 'profile';
//     }

//     highlightCurrentIcon(currentPage);

//     if (path !== '/') {
//         fetch(path)
//             .then(response => response.text())
//             .then(html => {
//                 document.getElementById('MainPage').innerHTML = html;
//                 highlightCurrentIcon(currentPage);
//             })
//             .catch(error => {
//                 console.error('Error:', error);
//                 document.getElementById('MainPage').innerHTML = '<h1>Error loading content</h1>';
//             });
//     }
// });

// function highlightCurrentIcon(currentPage) {
//     document.querySelectorAll('.side-menu_a').forEach(link => {
//         const icon = link.querySelector('.icon');
//         const text = link.querySelector('.icon-title');
//         const page = link.getAttribute('data-page');
//         const iconUrl = link.getAttribute('data-icon');
//         const highlightUrl = link.getAttribute('data-highlight');

//         if (page === currentPage) {
//             icon.src = highlightUrl;
//             icon.classList.add('highlight-icon1');
//             text.classList.add('highlight-span1');
//         } else {
//             icon.src = iconUrl;
//             text.classList.remove('highlight-span1');
//             icon.classList.remove('highlight-icon1');
//         }
//     });
// }

// function loadPage(event) {
//     event.preventDefault(); // Prevent default link behavior

//     const url = event.currentTarget.getAttribute('data-url');
//     const page = event.currentTarget.getAttribute('data-page');
//     console.log(url);
//     console.log(page);
//     // Update the URL in the browser's address bar
//     window.history.pushState({ url: url }, '', url);

//     // Fetch and update content
//     fetch(url)
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error('Network response was not ok');
//             }
//             return response.text();
//         })
//         .then(html => {
//             document.getElementById('MainPage').innerHTML = html;
//             highlightCurrentIcon(page);
//         })
//         .catch(error => {
//             console.error('Error:', error);
//             document.getElementById('MainPage').innerHTML = '<h1>Error loading content function loadPage</h1>';
//         });
// }

// // Handle browser back/forward buttons
// window.onpopstate = function(event) {
//     if (event.state && event.state.url && event.state.page) {
//         fetch(event.state.url)
//             .then(response => response.text())
//             .then(html => {
//                 document.getElementById('MainPage').innerHTML = html;
//                 highlightCurrentIcon(event.state.page);
//             })
//             .catch(error => {
//                 console.error('Error:', error);
//                 document.getElementById('MainPage').innerHTML = '<h1>Error loading content</h1>';
//             });
//     }
// };


// function loadPage(event) {
//     event.preventDefault(); // Previne o comportamento padrão do link

//     // Captura a URL do atributo data-url do elemento clicado
//     const url = event.currentTarget.getAttribute('data-url');

//     // Atualiza a URL no navegador
//     window.history.pushState({ url: url }, '', url);

//     // Carrega o conteúdo via AJAX
//     fetch(url)
//         .then(response => {
//             if (response.ok) {
//                 return response.text();
//             } else {
//                 throw new Error('Failed to load page');
//             }
//         })
//         .then(html => {
//             document.getElementById('MainPage').innerHTML = html;
//         })
//         .catch(error => {
//             console.error('Error:', error);
//             document.getElementById('MainPage').innerHTML = '<h1>Error loading content</h1>';
//         });
// }

// // Lida com o caso de usar o botão "voltar" do navegador
// window.onpopstate = function(event) {
//     if (event.state && event.state.url) {
//         fetch(event.state.url)
//             .then(response => response.text())
//             .then(html => {
//                 document.getElementById('content').innerHTML = html;
//             })
//             .catch(error => {
//                 console.error('Error:', error);
//                 document.getElementById('content').innerHTML = '<h1>Error loading content</h1>';
//             });
//     }
// };

// // Carrega o conteúdo inicial com base na URL
// document.addEventListener('DOMContentLoaded', () => {
//     const path = window.location.pathname;
//     if (path !== '/') {
//         fetch(path)
//             .then(response => response.text())
//             .then(html => {
//                 document.getElementById('content').innerHTML = html;
//             })
//             .catch(error => {
//                 console.error('Error:', error);
//                 document.getElementById('content').innerHTML = '<h1>Error loading content</h1>';
//             });
//     }
// });

