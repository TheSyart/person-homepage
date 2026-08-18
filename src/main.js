import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './style.css';

const app = createApp(App);

/* v-reveal：滚动进入视口时淡入，可传延迟毫秒数 v-reveal="120" */
app.directive('reveal', {
  mounted(el, binding) {
    el.classList.add('reveal-init');
    if (typeof binding.value === 'number') {
      el.style.transitionDelay = `${binding.value}ms`;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('reveal-show');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.08 });
    io.observe(el);
  }
});

app.use(router);
app.mount('#app');
