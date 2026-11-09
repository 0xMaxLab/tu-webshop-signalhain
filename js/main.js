// Shop functions (browser only, nothing is sent to a server)

var products = {
  'sh-spiel': { name: 'Signalhain (Vollversion)', price: 14.90 },
  'sh-ost': { name: 'Soundtrack „Oberhain“', price: 4.90 },
  'sh-bundle': { name: 'Signalhain + Soundtrack', price: 17.90 }
};

function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  showCount();
}

function showCount() {
  document.querySelectorAll('[data-cart-count]').forEach(function (el) {
    el.textContent = getCart().length;
  });
}

function message(text) {
  var status = document.getElementById('status');
  if (status) status.textContent = text;
}

function euro(n) {
  return n.toFixed(2).replace('.', ',') + ' €';
}

// Add to cart
document.querySelectorAll('[data-add]').forEach(function (button) {
  button.addEventListener('click', function () {
    var id = button.dataset.add;
    var cart = getCart();
    if (cart.indexOf(id) === -1) {
      cart.push(id);
      saveCart(cart);
    }
    message(products[id].name + ' ist im Warenkorb.');
  });
});

document.querySelectorAll('[data-demo]').forEach(function (button) {
  button.addEventListener('click', function () {
    message('Hier würde jetzt der Download der Demo starten.');
  });
});

// Cart page
function showCart() {
  var body = document.getElementById('cart-body');
  if (!body) return;

  var cart = getCart();
  var total = 0;
  body.innerHTML = '';
  document.getElementById('cart-empty').hidden = cart.length > 0;
  document.getElementById('cart-full').hidden = cart.length === 0;

  cart.forEach(function (id) {
    var p = products[id];
    total += p.price;
    var row = document.createElement('tr');
    row.innerHTML = '<th scope="row">' + p.name + '</th><td class="num">' + euro(p.price) + '</td>' +
      '<td><button type="button" class="linkbtn">Entfernen<span class="visually-hidden"> ' + p.name + '</span></button></td>';
    row.querySelector('button').addEventListener('click', function () {
      saveCart(getCart().filter(function (x) { return x !== id; }));
      showCart();
      message(p.name + ' wurde entfernt.');
    });
    body.appendChild(row);
  });

  document.getElementById('sum-net').textContent = euro(total / 1.2);
  document.getElementById('sum-vat').textContent = euro(total - total / 1.2);
  document.getElementById('sum-total').textContent = euro(total);
}

// Forms (contact and checkout): just show the confirmation
document.querySelectorAll('form[data-done]').forEach(function (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var done = document.getElementById(form.dataset.done);
    if (form.id === 'checkout-form') {
      saveCart([]);
      document.getElementById('checkout-area').hidden = true;
    } else {
      form.hidden = true;
    }
    done.hidden = false;
    done.focus();
  });
});

// Cookie banner (Matomo is not actually loaded)
var consent = document.getElementById('consent');
if (consent) {
  if (!localStorage.getItem('consent')) consent.hidden = false;

  var choose = function (value) {
    localStorage.setItem('consent', value);
    consent.hidden = true;
    message('Cookie-Einstellung gespeichert.');
  };
  document.getElementById('c-reject').onclick = function () { choose('notwendig'); };
  document.getElementById('c-accept').onclick = function () { choose('statistik'); };
  document.getElementById('c-save').onclick = function () {
    choose(document.getElementById('c-stats').checked ? 'statistik' : 'notwendig');
  };
  document.querySelectorAll('[data-consent-open]').forEach(function (b) {
    b.onclick = function () {
      consent.hidden = false;
      document.getElementById('consent-title').focus();
    };
  });
}

// Audio description: reads the video description track aloud
var video = document.getElementById('trailer');
if (video) {
  var adButton = document.getElementById('ad-toggle');
  var track = video.textTracks[1];
  var adOn = false;
  track.mode = 'hidden';
  track.oncuechange = function () {
    if (adOn && track.activeCues.length) {
      speechSynthesis.speak(new SpeechSynthesisUtterance(track.activeCues[0].text));
    }
  };
  adButton.onclick = function () {
    adOn = !adOn;
    adButton.setAttribute('aria-pressed', adOn);
    if (!adOn) speechSynthesis.cancel();
  };
}

showCount();
showCart();
