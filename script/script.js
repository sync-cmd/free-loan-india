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
  const question = item.querySelector('.faq-q');
  const answer = item.querySelector('.faq-a');
  const answerId = `faq-answer-${Array.from(item.parentElement.children).indexOf(item) + 1}`;
  answer.id = answerId;
  question.setAttribute('aria-controls', answerId);
  question.setAttribute('aria-expanded', 'false');

  question.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(faqItem => {
      faqItem.classList.remove('open');
      faqItem.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) {
      item.classList.add('open');
      question.setAttribute('aria-expanded', 'true');
    }
  });
});

// Explicitly align the booking card near the top, even when it is already
// partly visible in the mobile hero.
document.querySelectorAll('a[href="#bookCard"]').forEach(link => {
  link.addEventListener('click', event => {
    const bookingCard = document.getElementById('bookCard');
    if (!bookingCard) return;

    event.preventDefault();
    history.pushState(null, '', '#bookCard');
    window.scrollTo({
      top: Math.max(0, window.scrollY + bookingCard.getBoundingClientRect().top - 24),
      behavior: 'instant',
    });
  });
});

document.querySelectorAll('a[href="#top"]').forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();
    history.pushState(null, '', '#top');
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
});

// Testimonials carousel
const testimonialViewport = document.querySelector('.testimonial-viewport');
const testimonialTrack = testimonialViewport?.querySelector('.t-grid');
const testimonialCards = testimonialTrack ? Array.from(testimonialTrack.children) : [];
const testimonialDialog = document.querySelector('.testimonial-dialog');
const testimonialStatus = document.querySelector('.testimonial-status');

if (testimonialViewport && testimonialTrack && testimonialCards.length > 1 && testimonialDialog) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const closeButton = testimonialDialog.querySelector('.testimonial-close');
  const modalArt = testimonialDialog.querySelector('.testimonial-dialog-art');
  const modalQuote = testimonialDialog.querySelector('.testimonial-dialog-quote');
  const modalName = testimonialDialog.querySelector('#testimonial-dialog-name');
  let cycleWidth = 0;
  let offset = 0;
  let lastFrame = 0;
  let pointerStart = null;
  let dragged = false;
  let suppressClick = false;
  let lastFocusedButton = null;

  const measureCycle = () => {
    const gap = parseFloat(getComputedStyle(testimonialTrack).columnGap) || 0;
    cycleWidth = testimonialCards.reduce((width, card) => width + card.getBoundingClientRect().width, 0)
      + gap * testimonialCards.length;
    if (cycleWidth > 0) {
      offset %= cycleWidth;
      testimonialTrack.style.transform = `translate3d(${-offset}px, 0, 0)`;
    }
  };

  testimonialCards.forEach((card, index) => {
    card.dataset.testimonialIndex = String(index);
    const clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.querySelector('.t-art-button').tabIndex = -1;
    testimonialTrack.append(clone);
  });

  const isPaused = () => reducedMotion.matches
    || document.hidden
    || testimonialDialog.open;

  const animate = timestamp => {
    if (isPaused()) {
      lastFrame = 0;
    } else if (cycleWidth > 0) {
      if (lastFrame) offset = (offset + Math.min(timestamp - lastFrame, 80) * 0.024) % cycleWidth;
      testimonialTrack.style.transform = `translate3d(${-offset}px, 0, 0)`;
      lastFrame = timestamp;
    }
    window.requestAnimationFrame(animate);
  };

  const moveByCard = direction => {
    const gap = parseFloat(getComputedStyle(testimonialTrack).columnGap) || 0;
    offset = (offset + direction * (testimonialCards[0].getBoundingClientRect().width + gap) + cycleWidth) % cycleWidth;
    testimonialTrack.style.transform = `translate3d(${-offset}px, 0, 0)`;
    lastFrame = 0;
  };

  document.querySelectorAll('.testimonial-arrow').forEach(button => {
    button.addEventListener('click', () => moveByCard(button.dataset.direction === 'next' ? 1 : -1));
  });

  testimonialViewport.addEventListener('pointerdown', event => {
    if (event.button !== 0 || testimonialDialog.open) return;
    pointerStart = { x: event.clientX, offset, pointerId: event.pointerId };
    dragged = false;
    lastFrame = 0;
  });

  document.addEventListener('pointermove', event => {
    if (!pointerStart || event.pointerId !== pointerStart.pointerId) return;
    const distance = event.clientX - pointerStart.x;
    if (Math.abs(distance) > 5) dragged = true;
    if (dragged && cycleWidth > 0) {
      offset = (pointerStart.offset - distance + cycleWidth) % cycleWidth;
      testimonialTrack.style.transform = `translate3d(${-offset}px, 0, 0)`;
    }
  });

  const endPointer = event => {
    if (!pointerStart || event.pointerId !== pointerStart.pointerId) return;
    pointerStart = null;
    if (dragged) {
      suppressClick = true;
      window.setTimeout(() => { suppressClick = false; }, 0);
    }
    lastFrame = 0;
  };

  document.addEventListener('pointerup', endPointer);
  document.addEventListener('pointercancel', endPointer);
  testimonialViewport.addEventListener('click', event => {
    if (suppressClick) {
      event.preventDefault();
      event.stopPropagation();
      suppressClick = false;
    }
  }, true);

  testimonialViewport.addEventListener('click', event => {
    const button = event.target.closest('.t-art-button');
    if (!button) return;
    const card = button.closest('.t-card');

    const quote = card.querySelector('.t-copy p').textContent.trim();
    const name = card.querySelector('.t-copy b').textContent.trim();
    const art = card.querySelector('.testimonial-art').cloneNode(true);
    art.removeAttribute('aria-hidden');
    modalArt.replaceChildren(art);
    modalQuote.textContent = quote;
    modalName.textContent = name;
    const sourceCard = testimonialCards[Number(card.dataset.testimonialIndex)];
    lastFocusedButton = sourceCard.querySelector('.t-art-button');
    testimonialDialog.showModal();
    closeButton.focus();
  });

  closeButton.addEventListener('click', () => testimonialDialog.close());
  testimonialDialog.addEventListener('click', event => {
    if (event.target === testimonialDialog) testimonialDialog.close();
  });
  testimonialDialog.addEventListener('close', () => {
    if (lastFocusedButton?.isConnected) lastFocusedButton.focus();
  });
  document.querySelectorAll('.testimonial-arrow').forEach(button => {
    button.addEventListener('click', () => {
      if (testimonialStatus) testimonialStatus.textContent = 'Testimonials moved.';
    });
  });
  reducedMotion.addEventListener('change', event => {
    if (!event.matches) lastFrame = 0;
  });
  window.addEventListener('resize', measureCycle, { passive: true });

  measureCycle();
  window.requestAnimationFrame(animate);
}

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
      if (testimonialDialog?.open) {
        testimonialDialog.close();
        return;
      }
      menuButton.focus();
    }
  });
}
