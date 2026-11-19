// Country code picker: flag images + dial codes, searchable.
(function () {
  // [ISO2, Name, Dial code]
  var COUNTRIES = [
    ['IN','India','91'],['US','United States','1'],['GB','United Kingdom','44'],
    ['AE','United Arab Emirates','971'],['AU','Australia','61'],['SG','Singapore','65'],
    ['CA','Canada','1'],['DE','Germany','49'],['FR','France','33'],['IT','Italy','39'],
    ['ES','Spain','34'],['NL','Netherlands','31'],['CH','Switzerland','41'],['SE','Sweden','46'],
    ['NO','Norway','47'],['DK','Denmark','45'],['FI','Finland','358'],['IE','Ireland','353'],
    ['BE','Belgium','32'],['AT','Austria','43'],['PT','Portugal','351'],['PL','Poland','48'],
    ['GR','Greece','30'],['CZ','Czechia','420'],['RO','Romania','40'],['HU','Hungary','36'],
    ['UA','Ukraine','380'],['RU','Russia','7'],['TR','Turkey','90'],['SA','Saudi Arabia','966'],
    ['QA','Qatar','974'],['KW','Kuwait','965'],['OM','Oman','968'],['BH','Bahrain','973'],
    ['IL','Israel','972'],['EG','Egypt','20'],['ZA','South Africa','27'],['NG','Nigeria','234'],
    ['KE','Kenya','254'],['GH','Ghana','233'],['JP','Japan','81'],['KR','South Korea','82'],
    ['CN','China','86'],['HK','Hong Kong','852'],['TW','Taiwan','886'],['TH','Thailand','66'],
    ['MY','Malaysia','60'],['ID','Indonesia','62'],['PH','Philippines','63'],['VN','Vietnam','84'],
    ['BD','Bangladesh','880'],['LK','Sri Lanka','94'],['NP','Nepal','977'],['PK','Pakistan','92'],
    ['BT','Bhutan','975'],['MV','Maldives','960'],['NZ','New Zealand','64'],['BR','Brazil','55'],
    ['MX','Mexico','52'],['AR','Argentina','54'],['CL','Chile','56'],['CO','Colombia','57']
  ];

  var root = document.getElementById('countryPicker');
  if (!root) return;

  var hidden = document.getElementById('countryCode');
  var phone = document.getElementById('phone');
  var btn = root.querySelector('.cp-btn');
  var panel = root.querySelector('.cp-panel');
  var search = root.querySelector('.cp-search');
  var list = root.querySelector('.cp-list');

  function flag(iso) {
    var l = iso.toLowerCase();
    return '<img class="cp-flag" width="20" height="15" alt="" loading="lazy" ' +
      'src="https://flagcdn.com/w40/' + l + '.png" ' +
      'srcset="https://flagcdn.com/w80/' + l + '.png 2x">';
  }

  function render(filter) {
    var q = (filter || '').trim().toLowerCase().replace(/^\+/, '');
    list.innerHTML = '';
    COUNTRIES.forEach(function (c) {
      if (q && c[1].toLowerCase().indexOf(q) === -1 && c[2].indexOf(q) !== 0 && c[0].toLowerCase() !== q) return;
      var li = document.createElement('li');
      li.setAttribute('role', 'option');
      li.dataset.iso = c[0];
      li.innerHTML = flag(c[0]) + '<span class="cp-name">' + c[1] + '</span><span class="cp-dial">+' + c[2] + '</span>';
      li.addEventListener('click', function () { select(c); close(); });
      list.appendChild(li);
    });
  }

  function select(c) {
    hidden.value = '+' + c[2];
    btn.innerHTML = flag(c[0]) + '<span>+' + c[2] + '</span><span class="cp-caret">▾</span>';
    // India = exactly 10 digits, others up to 15 (E.164 max)
    phone.maxLength = c[2] === '91' ? 10 : 15;
    phone.value = phone.value.replace(/\D/g, '').slice(0, phone.maxLength);
  }

  function open() { panel.hidden = false; btn.setAttribute('aria-expanded', 'true'); search.value = ''; render(''); search.focus(); }
  function close() { panel.hidden = true; btn.setAttribute('aria-expanded', 'false'); }

  btn.addEventListener('click', function () { panel.hidden ? open() : close(); });
  search.addEventListener('input', function () { render(search.value); });
  search.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); var first = list.querySelector('li'); if (first) first.click(); }
    if (e.key === 'Escape') close();
  });
  document.addEventListener('click', function (e) { if (!root.contains(e.target)) close(); });

  // Digits only in the phone field
  phone.addEventListener('input', function () {
    phone.value = phone.value.replace(/\D/g, '').slice(0, phone.maxLength > 0 ? phone.maxLength : 15);
  });
  phone.addEventListener('paste', function (e) {
    e.preventDefault();
    var t = (e.clipboardData || window.clipboardData).getData('text');
    phone.value = t.replace(/\D/g, '').slice(0, phone.maxLength > 0 ? phone.maxLength : 15);
  });

  // Reset back to India when the form is reset
  var form = phone.closest('form');
  if (form) form.addEventListener('reset', function () { setTimeout(function () { select(COUNTRIES[0]); }, 0); });

  // Validation helper used by the form submit handler
  window.GlogixPhone = {
    validate: function (dialCode, digits) {
      if (dialCode === '+91') {
        return /^[6-9]\d{9}$/.test(digits) ? '' : 'Enter a valid 10 digit Indian mobile number.';
      }
      return /^\d{6,15}$/.test(digits) ? '' : 'Enter a valid phone number (6-15 digits).';
    }
  };

  select(COUNTRIES[0]); // default: India
})();