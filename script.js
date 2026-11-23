const $ = (id) => document.getElementById(id);

// 모바일 메뉴
function setMenu(open) {
  $('menu').hidden = !open;
  $('menu-open').setAttribute('aria-expanded', open);
}
$('menu-open').addEventListener('click', () => setMenu(true));
$('menu-close').addEventListener('click', () => setMenu(false));
$('menu').querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));

// 페이지 안 이동: 주소창에 #work 같은 표시를 남기지 않고 스크롤만
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const target = document.getElementById(a.getAttribute('href').slice(1));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ block: 'start' });
  });
});
