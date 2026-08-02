if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

const resetPageScroll = () => {
  window.scrollTo(0, 0);
};

window.addEventListener('load', resetPageScroll);
window.addEventListener('pageshow', resetPageScroll);
