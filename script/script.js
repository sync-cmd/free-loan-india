document.getElementById('year').textContent = new Date().getFullYear();

// Reach toggle styling
const waOpt = document.getElementById('waOpt');
const emailOpt = document.getElementById('emailOpt');
document.querySelectorAll('input[name="reach"]').forEach(r => {
  r.addEventListener('change', () => {
    waOpt.classList.toggle('selected', r.value === 'WhatsApp' && r.checked);
    emailOpt.classList.toggle('selected', r.value === 'Email' && r.checked);
  });
});

// Form submit -> Web3Forms (emails the enquiry to the owner)
// 1) Create a free key at https://web3forms.com using loanfreeeindia@gmail.com
// 2) Paste it below
const WEB3FORMS_KEY = 'PASTE_YOUR_WEB3FORMS_ACCESS_KEY_HERE';

const phoneEl = document.getElementById('phone');
phoneEl.addEventListener('input', () => {
  phoneEl.value = phoneEl.value.replace(/\D/g,'').slice(0,10);
  document.getElementById('phoneErr').textContent = '';
});

document.getElementById('apptForm').addEventListener('submit', function(e){
  e.preventDefault();
  const err = document.getElementById('formErr');
  const phoneErr = document.getElementById('phoneErr');
  err.textContent = ''; phoneErr.textContent = '';

  const name = document.getElementById('name').value.trim();
  const phone = phoneEl.value.trim();
  const loanType = document.getElementById('loanType').value;
  const amount = document.getElementById('amount').value;
  const email = document.getElementById('email').value.trim();
  const issue = document.getElementById('issue').value.trim();
  const reach = document.querySelector('input[name="reach"]:checked').value;

  if(!name){ err.textContent='Please enter your name.'; return; }
  if(!/^[6-9]\d{9}$/.test(phone)){ phoneErr.textContent='Enter a valid 10-digit mobile number starting with 6, 7, 8 or 9.'; phoneEl.focus(); return; }
  if(!amount){ err.textContent='Please select the outstanding amount.'; return; }
  if(email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ err.textContent='Please enter a valid email address or leave it blank.'; return; }
  if(!issue){ err.textContent='Please tell us briefly what you need help with.'; return; }
  if(!document.getElementById('consent').checked){ err.textContent='Please tick the consent box to continue.'; return; }
  if(document.getElementById('botcheck').checked) return;

  const btn = document.getElementById('submitBtn');
  btn.disabled = true; btn.textContent = 'Redirecting...';

  const textMsg = `New Appointment Request
Name: ${name}
Mobile: +91 ${phone}
Email: ${email || 'Not provided'}
Loan Type: ${loanType}
Outstanding Amount: ${amount}
Preferred Contact: ${reach}

Issue:
${issue}`;

  if (reach === 'WhatsApp') {
    const waUrl = `https://wa.me/918920684649?text=${encodeURIComponent(textMsg)}`;
    window.open(waUrl, '_blank');
  } else {
    const mailUrl = `mailto:loanfreeeindia@gmail.com?subject=${encodeURIComponent('New Appointment Request — ' + name)}&body=${encodeURIComponent(textMsg)}`;
    window.location.href = mailUrl;
  }

  document.getElementById('apptForm').style.display='none';
  document.getElementById('successBox').classList.add('show');
  btn.disabled = false; btn.textContent = 'Request my appointment';
});

// FAQ accordion
document.querySelectorAll('.faq-item').forEach(item => {
  item.querySelector('.faq-q').addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if(!isOpen) item.classList.add('open');
  });
});

// Mobile navigation
const menuButton = document.querySelector('.burger');
const primaryNavigation = document.getElementById('primary-navigation');

function closeNavigation() {
  if (!menuButton || !primaryNavigation) return;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation menu');
  primaryNavigation.classList.remove('is-open');
}

if (menuButton && primaryNavigation) {
  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Open navigation menu' : 'Close navigation menu');
    primaryNavigation.classList.toggle('is-open', !isOpen);
  });

  primaryNavigation.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeNavigation);
  });

  document.addEventListener('click', event => {
    if (!primaryNavigation.contains(event.target) && !menuButton.contains(event.target)) {
      closeNavigation();
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeNavigation();
      menuButton.focus();
    }
  });
}
