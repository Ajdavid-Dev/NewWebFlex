window.addEventListener('DOMContentLoaded', () => {
  window.lucide && lucide.createIcons();
  // duplicate marquee content for a seamless loop
  const track = document.getElementById('bankTrack');
  track.innerHTML += track.innerHTML;
});
// Scroll reveal
const io = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }), {threshold:.15});
document.querySelectorAll('.reveal').forEach(el => io.observe(el));
// Toasts (simulated actions)
let toastT;
function landToast(msg){
  const t=document.getElementById('toast');
  document.getElementById('toastMsg').textContent=msg;
  t.classList.add('show'); clearTimeout(toastT);
  toastT=setTimeout(()=>t.classList.remove('show'), 3400);
}

// function joinWaitlist(form){
//   const email=form.querySelector('input').value;
//   form.querySelector('input').value='';
//   landToast('You just joined the waitlist! '+email.split('@')[0]+' 🎉 ');
// }

function joinWaitlist(form){
  const input = form.querySelector('input[type="email"]');
  const email = input.value;
  const btn = form.querySelector('button');
  const btnLabel = btn.textContent;

  btn.disabled = true;
  btn.textContent = 'Joining…';

  const data = new FormData(form);

  fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(data).toString()
  })
    .then(() => {
      input.value = '';
      landToast('You’re on the list, ' + email.split('@')[0] + '! 🎉');
    })
    .catch(() => {
      landToast('Hmm, that didn’t go through — mind trying again? 🙏');
    })
    .finally(() => {
      btn.disabled = false;
      btn.textContent = btnLabel;
    });
}
